import uuidv1 from 'uuid/v1';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import { SECRET, TOKEN_TTL_S, REFRESH_TTL_S, TOKEN_TTL_N, REFRESH_TTL_N, PrivateKey, PublicKey } from '../config/config';
import { logger, errorLogger } from '../config/logger'
import models from "../models";
import moment from 'moment';


const createTokens = async (user, rememberMe, sessionId, refreshTokenExp) => {

	if (user.activesession) {
		sessionId = user.activesession;
		//console.log('user.activesession:  ' + user.activesession);
	}


	let vTOKEN_TTL_S = '15s';// TOKEN_TTL_S;
	let vREFRESH_TTL_S = REFRESH_TTL_S;
	//let vTOKEN_TTL_N = TOKEN_TTL_N;
	let vREFRESH_TTL_N = REFRESH_TTL_N;

	if (rememberMe === 'on') {
		vTOKEN_TTL_S = '30d';
		vREFRESH_TTL_S = '356d';
		//vTOKEN_TTL_N = 1000 * 60 * 60 * 24 * 30;
		vREFRESH_TTL_N = 1000 * 60 * 60 * 24 * 365;
	}
	if (refreshTokenExp > 0) {
		vREFRESH_TTL_S = refreshTokenExp;
	}

	//vTOKEN_TTL_S = '20m';
	//vREFRESH_TTL_S = '50m';

	const tokenSignOptions = {
		issuer: 'dse-stock-man',
		audience: 'localhost',
		algorithm: "RS256",
		expiresIn: vTOKEN_TTL_S
	};

	const refreshTokenSignOptions = {
		issuer: 'dse-stock-man',
		audience: 'localhost',
		expiresIn: vREFRESH_TTL_S
	};

	const createToken = jwt.sign(
		{
			user: _.pick(user, ['userid', 'admin'])
		},
		PrivateKey,
		tokenSignOptions
	);



	const createRefreshToken = jwt.sign(
		{
			user: _.pick(user, ['userid', 'admin']),
		},
		sessionId,
		refreshTokenSignOptions
	);

	if (!user.activesession) {
		await models.sysUsers.update(
			{
				activesession: sessionId,
				sessionexpirydate: new Date(Date.now() + vREFRESH_TTL_N),
				resetpasswordurl: '',
				forcepassword: 0,
				islocked: 0
			},
			{
				where: {
					userid: user.userid
				}
			}
		);
	}

	return Promise.all([createToken, createRefreshToken]);
};

const refreshTokens = async (refreshToken, user) => {

	try {
		const tokenData = jwt.decode(refreshToken);

		let refreshTokenExp = tokenData.exp - tokenData.iat;

		const sid = uuidv1();
		const [newToken, newRefreshToken] = await createTokens(user, "", sid, refreshTokenExp);
		let objTokenUser = _.pick(tokenData.user, ['userid', 'admin']);

		return {
			token: newToken,
			refreshToken: newRefreshToken,
			user: objTokenUser
		};
	}
	catch (err) {
		throw new Error(err.message);
	}
};

const verifyToken = (token) => {
	return new Promise((resolve, reject) => {
		try {
			var verifyOptions = {
				issuer: 'dse-stock-man',
				audience: 'localhost',
				expiresIn: TOKEN_TTL_S,
				algorithm: "RS256"
			};

			let result = jwt.verify(token, PublicKey, verifyOptions);
			resolve(result);

		}
		catch (ex) {
			reject(ex);
		}
	});
}
const verifyRefreshToken = (refreshToken) => {
	return new Promise(async (resolve, reject) => {
		try {
			let userId = -1;
			try {
				const { user: { userid } } = jwt.decode(refreshToken);
				userId = userid;
			} catch (err) {
				resolve("Invalid Token");
			}

			if (!userId) {
				resolve("Invalid Token Data");
			}

			const user = await models.sysUsers.findOne({ where: { userid: userId }, raw: true });



			if (!user) {
				resolve("Invalid User");
			}

			try {
				jwt.verify(refreshToken, user.activesession);
				resolve(user);
			} catch (err) {
				if (err.name == "TokenExpiredError") {
					resolve("TokenExpiredError");
				}
				else {
					resolve(err.message);
				}
			}

		}
		catch (ex) {
			reject(ex);
		}
	});
}


export const generateToken = async (email, password, rememberMe) => {

	// const salt = bcrypt.genSaltSync(10);
	// const hashPass = bcrypt.hashSync("123", salt);


	// 	models.sysUsers.create({
	//     email: "mushariar@gmail.com",
	// 	  passwordstring: hashPass,
	// 	  firstname: "Mushariar",
	// 	  lastname: "Ahmmed",        
	// 	  admin: true,
	// 	  allowedip: null,
	// 	  forcepassword: 0,
	// 	  wrongpassattempt: 0,
	// 	  islocked: 0,
	// 	  autounlock: new Date(Date.now() + (1000*60*60*24*3650)),
	// 	  isactive: 1,
	// 	  passwordexpirydate: new Date(Date.now() + (1000*60*60*24*90)),
	// 	  resetpasswordurl: null,
	// 	  updatedby: 1,        
	// 	  createdby: 1
	//   });



	const user = await models.sysUsers.findOne({ where: { email: email } });

	if (!user) {
		//logger(moment().format("YYYY-MM-DD HH:mm:ss") + ',' + ip + ','+ res.sessionId + ',' + String(new Date() - res.startTime));
		errorLogger(moment().format("YYYY-MM-DD HH:mm:ss") + ', Invalid login for: ' + email);
		throw new Error('Invalid login');
	}

	if (user.isactive == 0) {

		errorLogger(moment().format("YYYY-MM-DD HH:mm:ss") + ', Inactive user: ' + email);
		throw new Error('Inactive user');

	}

	let valid = false;
	valid = await bcrypt.compare(password, user.passwordstring);
	//const valid = true;

	if (!valid) {

		errorLogger(moment().format("YYYY-MM-DD HH:mm:ss") + ', Invalid credentials: ' + email);
		throw new Error('Invalid credentials');
	}

	const sid = uuidv1();

	// if(!user.allowmultilogin)
	// 	user.activesession = null; //for force create new session in every call and logout other user

	const [token, refreshToken] = await createTokens(user, rememberMe, sid, 0);

	await models.sysUsers.update(
		{
			resetpasswordurl: ''
		},
		{
			where: {
				userid: user.userid
			}
		}
	);

	let objTokenUser = _.pick(user, ['userid', 'admin', 'firstname', 'lastname']);
	return {
		token: token,
		refreshToken: refreshToken,
		user: objTokenUser
	};
};

export const varifyOnlyToken = async (token) => {
	return new Promise((resolve, reject) => {
	try {

		if (token) {
			verifyToken(token).then((verifiedToken)=>{
				resolve(true);
			})
			.catch((err)=>{
				resolve(false);
			})
			
		}
		else { resolve(false); }
	} catch (err) {
		resolve(false);
	}
});
}

export const renewToken = async (domain, token, refreshToken, user) => {

	let newTokens;

	try {

		if (token) {
			let verifiedToken = await verifyToken(token);
			// if (verifiedToken.aud != domain) return "domain not same !!";
		}

		let verifiedrefToken = await verifyRefreshToken(refreshToken);

		if (typeof (verifiedrefToken) !== "object") {
			return verifiedrefToken;
		}
		else {
			newTokens = await refreshTokens(
				refreshToken,
				user
			);
			return newTokens;
		}
	} catch (err) {
		if (err.name == "TokenExpiredError") {
			let verifiedrefToken = await verifyRefreshToken(refreshToken);

			if (typeof (verifiedrefToken) !== "object") {
				return verifiedrefToken;
			}
			else {
				newTokens = await refreshTokens(
					refreshToken,
					user
				);
				return newTokens;
			}
		}
		else {
			return err.message;
		}

	}

};



export const passwordResetToken = async (email, pmemberid) => {


	// const user = await models.sysUsers.findOne({ where: { email: email } });

	// if (!user) {
	// 	//errorLogger(moment().format("YYYY-MM-DD HH:mm:ss") + ', Invalid email: ' + email);
	// 	throw new Error('Invalid login: ' + email);
	// }

	// if (user.isactive === 0) {
	// 	//errorLogger(moment().format("YYYY-MM-DD HH:mm:ss") + ', Inactive account: ' + email);
	// 	throw new Error('Account is Locked');
	// }

	const tokenSignOptions = {
		issuer: 'dse-stock-man',
		audience: 'localhost',
		algorithm: "RS256",
		expiresIn: '3d'
	};

	const createToken = jwt.sign(
		{
			user: { memberid: pmemberid, email: email }
		},
		PrivateKey,
		tokenSignOptions
	);


	await models.sysUsers.update(
		{
			resetpasswordurl: 'generated'
		},
		{
			where: {
				memberid: pmemberid
			}
		}
	);

	return createToken;
};

export const verifyPasswordResetToken = (pToken) => {
	return new Promise(async (resolve, reject) => {
		try {
			let email = "-1";
			let memberId = "-1";
			let tokenData;

			try {
				tokenData = await jwt.decode(pToken);

				try {
					var verifyOptions = {
						issuer: 'dse-stock-man',
						audience: 'localhost',
						expiresIn: '3d',
						algorithm: "RS256"
					};

					jwt.verify(pToken, PublicKey, verifyOptions);
				} catch (err) {
					if (err.name == "TokenExpiredError") {
						reject("Your link has expired.");
					}
					else {
						reject(err.message);
					}

				}

				email = tokenData.user.email;
				memberId = tokenData.user.memberid;

				if (!email) {
					reject("Invalid Token Data");
				}

				const user = await models.sysUsers.findOne({ where: { memberid: memberId, email: email }, raw: true });

				if (!user) {
					reject("Invalid User");
				}
				if (user.resetpasswordurl != 'generated') {
					reject("Invalid or used link.");
				}

				resolve(tokenData);
			} catch (err) {
				console.log(err);
				reject("Invalid Token");
			}
		}
		catch (e) {
			reject(e.message);
		}
	});
}