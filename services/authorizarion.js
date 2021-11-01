import jwt from 'jsonwebtoken';
import { generateToken, varifyOnlyToken, renewToken, passwordResetToken, verifyPasswordResetToken } from './generateJWT';
import { logger, errorLogger } from '../config/logger';
import models from "../models";
import moment from 'moment';
import { getSqlQueryResult } from "./dbfunctions";
import bcrypt from 'bcryptjs';
var mail = require('../utl/email/mailerWithTemp');
require('dotenv').config();

const setCookie = (res, newTokens, TokenExp, refreshTokenExp) => {
	res.cookie("token", newTokens.token, {
		maxAge: TokenExp * 1000,
		expires: new Date(Date.now() + (TokenExp * 1000)),
		httpOnly: true,
	});
	res.cookie("refreshToken", newTokens.refreshToken, {
		maxAge: refreshTokenExp * 1000,
		expires: new Date(Date.now() + (refreshTokenExp * 1000)),
		httpOnly: true,
	});
}

const clearCookie = (res) => {
	res.clearCookie('token');
	res.clearCookie('refreshToken');
}

export const doLogin = async (req, res) => {
	try {
		let pemail = req.body.email;
		let ppassword = req.body.password;
		let prememberMe = "";
		if (req.body.rememberme) {
			prememberMe = req.body.rememberme;
		}

		if (!pemail || !ppassword) {
			errorLogger(moment().format("YYYY-MM-DD HH:mm:ss") + ', Email and password is mandatory');
			throw "Email and password is mandatory"
		}

		if (pemail.indexOf("@") < 1) {
			throw new Error('Invalid email');
		}

		var newTokens = await generateToken(pemail.toLowerCase(), ppassword, prememberMe);

		if (newTokens.token && newTokens.refreshToken) {
			let tokenData = jwt.decode(newTokens.token);
			let refreshTokenData = jwt.decode(newTokens.refreshToken);

			let TokenExp = tokenData.exp - tokenData.iat;
			let refreshTokenExp = refreshTokenData.exp - refreshTokenData.iat;

			setCookie(res, newTokens, TokenExp, refreshTokenExp);

			return newTokens;
		}
		else {
			errorLogger(moment().format("YYYY-MM-DD HH:mm:ss") + ', ' + newTokens + ': ' + pemail);
			throw new Error(newTokens);
		}
	}
	catch (e) {
		throw e;
	}
}

export const doLogout = async (req, res) => {

	try {
		if (req.cookies.refreshToken) {
			let refreshTokenData = jwt.decode(req.cookies.refreshToken);
			let userid = refreshTokenData.user.userid;
			let user = await models.sysUsers.findOne({ where: { userid } });

			if (user.activesession) {
				await models.sysUsers.update(
					{
						activesession: null,
						sessionexpirydate: new Date(Date.now())
					},
					{
						where: {
							userid: user.userid
						}
					}
				);
			}
		}
		clearCookie(res);

	} catch (err) {
		clearCookie(res);

		let error = {};
		error.message = err.message ? err.message : err;
		throw err;
	}
}

export const refreshAuthToken = async (req, res, isAdmin) => {
	try {
		let refOldTokenData = {};
		if (!req.cookies.refreshToken) {
			let err = {};
			err.message = 'No token Provided';
			throw err;
		}
		else {
			refOldTokenData = await jwt.decode(req.cookies.refreshToken);
			if (isAdmin === 1 && refOldTokenData.user.admin !== 1) {
				throw Error("You do not have access...");
			}
		}
		var isToken = await varifyOnlyToken(req.cookies.token);
		if (isToken) {
			req.user = refOldTokenData.user;
		}
		else {
			var newTokens = await renewToken(req.hostname, req.cookies.token, req.cookies.refreshToken, refOldTokenData.user);

			if (newTokens.token && newTokens.refreshToken) {

				let tokenData = jwt.decode(newTokens.token);
				if (isAdmin === 1 && tokenData.user.admin !== 1) {
					throw Error("You do not have access.");
				}

				let refreshTokenData = jwt.decode(newTokens.refreshToken);

				let TokenExp = tokenData.exp - tokenData.iat;
				let refreshTokenExp = refreshTokenData.exp - refreshTokenData.iat;

				setCookie(res, newTokens, TokenExp, refreshTokenExp);
			}
			else {
				clearCookie(res);
				let err = {};
				err.message = newTokens;
				throw err;
			}
			req.user = newTokens.user;
		}
		//next();
		return true;

	} catch (err) {
		clearCookie(res);

		let error = {};
		error.message = err.message ? err.message : err;
		throw err;
	}

}
export const getLoggedUserProfile = async (req, res) => {
	return new Promise(async (resolve, reject) => {
	try {

		let refOldTokenData = {};
		if (!req.cookies.refreshToken) {
			resolve(false);
		}
		else {

			refOldTokenData = await jwt.decode(req.cookies.refreshToken);

			const dynamicSearch = `SELECT
										u.userid,
										a.fullname as name,
										u.email,
										u.profilpicurl,
										a.id as accountid,
										u.admin
									FROM
										sys_users u
									LEFT OUTER JOIN account_registrations a ON
										a.userid = u.userid and a.isdefault = 1
									WHERE
										u.userid =:userid`;

			var bindVars = {
				userid: refOldTokenData.user.userid
			};

			getSqlQueryResult(dynamicSearch, bindVars, models)
				.then(function (result) {
					resolve(result[0]);
				}).catch(function (e) {
					console.log(e);
					resolve(false);
				});
		}

	} catch (err) {
		clearCookie(res);
		resolve(false);
	}
});

}

export const getPasswordResetToken = async (pemail, pmemberid) => {

	try {
		if (!pemail) {
			throw "Email is mandatory"
		}

		if (pemail.indexOf("@") < 1) {
			throw new Error('Invalid email');
		}

		var newToken = await passwordResetToken(pemail.toLowerCase(), pmemberid);
		return newToken;
	}
	catch (e) {
		throw e;
	}

}

export const checkPasswordResetToken = async (pToken) => {

	try {
		var user = await verifyPasswordResetToken(pToken);
		return user;
	}
	catch (e) {
		throw e;
	}
}

export const resetPassword = async (email, newpass, confirmpass, res) => {

	try {
		if (newpass !== confirmpass) {
			//error
			throw new Error('Password does not match');
		}
		else {
			let user = await models.sysUsers.findOne({ where: { email: email } });

			const salt = bcrypt.genSaltSync(10);
			const hashPass = bcrypt.hashSync(newpass, salt);

			if (!user) {
				//errorLogger(moment().format("YYYY-MM-DD HH:mm:ss") + ', Invalid login for: ' + email);
				throw new Error('Invalid login');
			}

			if (user.isactive == 0) {
				//errorLogger(moment().format("YYYY-MM-DD HH:mm:ss") + ', Inactive user: ' + email);
				throw new Error('Inactive user');
			}

			await models.sysUsers.update(
				{
					activesession: null,
					sessionexpirydate: new Date(Date.now()),
					passwordstring: hashPass,
					resetpasswordurl: null,
					isactive: 1
				},
				{
					where: {
						userid: user.userid
					}
				}
			);
		}
		clearCookie(res);
		return true;

	} catch (err) {
		clearCookie(res);

		let error = {};
		error.message = err.message ? err.message : err;
		throw err;
	}
}

export const forgetPasswordRequest = async (pemail, pmemberid) => {

	let baseUrl = process.env['BASEURL'];
	try {
		if (!pemail || !pmemberid) {
			throw "Mandatory field is missing."
		}

		if (pemail.indexOf("@") < 1) {
			throw new Error('Invalid email');
		}

		var newToken = await passwordResetToken(pemail.toLowerCase(), pmemberid);

		let user = await models.sysUsers.findOne({ where: { email: pemail } });

		let changePass = {};
		changePass.email = pemail;
		changePass.fullname_bn = user.fullname_bn;
		changePass.passwordtoken = newToken;
		changePass.redirecturl = baseUrl + "/resetpassword";

		await mail.sendPasswordReset(changePass);


		return true;
	}
	catch (e) {
		throw e;
	}

}