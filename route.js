import { doLogin, doLogout, getLoggedUserProfile, refreshAuthToken, resetPassword } from './services/authorizarion';
import dbDataSrvc from './services/dbDataService';
//import { applicationLogger, logger, errorLogger, resultLogger } from "./config/logger";
import logger from "./config/logger";
// import { division, district, bloodgroups } from './config/listdata';
// import { memberImagePath, albumImagePath } from './config/filepaths';
import moment from 'moment';
// const path = require('path');
var uuidv4 = require('uuid/v4');

module.exports = (app) => {

  var authTokenChecker = async (req, res, next) => {
    try {
      await refreshAuthToken(req, res, 0);
      next();
    }
    catch (ex) {
      req.session.sessionFlash = {
        type: 'danger',
        message: ex.message
      }

      res.redirect('/');
    }
  };

  var gettLoggedUserProfile = async (req, res) => {
    return new Promise(async (resolve, reject) => {
      try {
        let result = {}
        let vLoginData = getLoggedUserProfile(req, res);
        let priceupdat = dbDataSrvc.getIdxUpdateStatus({ updtindex: "TODAYINFO" });

        Promise.all([vLoginData, priceupdat]).then(function (p) {

          console.log(p[0]);

          result.login = p[0];
          result.marketstatus = p[1];

          resolve(result);
        });

      }
      catch (e) {
        console.log(e);
        return null;
      }
    });
  }


  app.route('/')
    .get(async (req, res) => {
      try {
        var login = await gettLoggedUserProfile(req, res);

        res.render(__dirname + '/views/index.ejs', { data: { login: login.login, marketstatu: login.marketstatus, notification: { type: '', message: '' } } });
      }
      catch (e) {
        console.log(e);
        res.render(__dirname + '/views/index.ejs', { data: { login: null, notification: { type: 'danger', message: e.message } } });
      }

    });

  app.route('/index')
    .get(async (req, res) => {
      res.redirect('/');
    });

  app.route('/login')
    .get(async (req, res) => {
      var login = await gettLoggedUserProfile(req, res);
      try {
        if (res.locals.sessionFlash)
          res.render(__dirname + '/views/login.ejs', { data: { login: login.login, marketstatu: login.marketstatus, notification: { type: res.locals.sessionFlash.type, message: res.locals.sessionFlash.message } } });
        else
          res.render(__dirname + '/views/login.ejs', { data: { login: login.login, marketstatu: login.marketstatus, notification: { type: '', message: '' } } });
      }
      catch (err) {
        console.log(err);
        res.render(__dirname + '/views/login.ejs', { data: { login: {}, notification: { type: 'danger', message: err.message } } });
      }
    })
    .post(async (req, res) => {
      try {
        await doLogin(req, res);
        res.redirect('/dashboard');
      }
      catch (ex) {
        req.session.sessionFlash = {
          type: 'danger',
          message: ex.message
        }
        res.render(__dirname + '/views/login.ejs', { data: { login: false, notification: { type: 'danger', message: ex.message } } });
      }
    });

  app.route('/dashboard')
    .get(authTokenChecker, async (req, res) => {
      try {
        var login = await gettLoggedUserProfile(req, res);

        res.render(__dirname + '/views/dashboard.ejs', { data: { login: login.login, marketstatu: login.marketstatus, notification: { type: '', message: '' } } });
      }
      catch (e) {
        console.log(e);
        res.render(__dirname + '/views/dashboard.ejs', { data: { login: login.login, marketstatu: login.marketstatus, notification: { type: 'danger', message: e.message } } });
      }
    });





  app.route('/reports')
    .get(authTokenChecker, async (req, res) => {
      try {
        var login = await gettLoggedUserProfile(req, res);

        res.render(__dirname + '/views/reports.ejs', { data: { login: login.login, marketstatu: login.marketstatus, notification: { type: '', message: '' } } });
      }
      catch (e) {
        console.log(e);
        res.render(__dirname + '/views/reports.ejs', { data: { login: login.login, marketstatu: login.marketstatus, notification: { type: 'danger', message: e.message } } });
      }
    });


  app.route('/transaction')
    .get(authTokenChecker, async (req, res) => {
      try {
        var login = await gettLoggedUserProfile(req, res);

        res.render(__dirname + '/views/transaction.ejs', { data: { login: login.login, marketstatu: login.marketstatus, notification: { type: '', message: '' } } });
      }
      catch (e) {
        console.log(e);
        res.render(__dirname + '/views/transaction.ejs', { data: { login: login.login, marketstatu: login.marketstatus, notification: { type: 'danger', message: e.message } } });
      }
    })
    .post(authTokenChecker, async (req, res) => {
      try {
        var login = await gettLoggedUserProfile(req, res);

        var trxEntry = await dbDataSrvc.transactionEntry({
          accountid: req.body.trxaccountid,
          transdate: req.body.trxtransdate,
          transtype: req.body.trxtranstype,
          companycode: req.body.trxtradingcode,
          quantity: req.body.trxquantity,
          rate: req.body.trxrate,
          commission: req.body.trxcommission,
          amount: req.body.trxamount,
          avgcost: req.body.trxavgcost,
          dividendpct: req.body.trxdividendpct,
          comments: req.body.trxcomments
        });

        req.session.sessionFlash = {
          type: 'success',
          message: 'Transaction saved successfully'
        }

        res.redirect('/dashboard');
      }
      catch (e) {
        req.session.sessionFlash = {
          type: 'danger',
          message: err.message
        }
        res.redirect('/account');
      }
    });








  app.route('/companyinfo/:companycode')
    .get(authTokenChecker, async (req, res) => {
      try {
        var login = await gettLoggedUserProfile(req, res);
        var companyinfo = await dbDataSrvc.getCompanyInfo({ companyCode: req.params.companycode });
        var week52range = await dbDataSrvc.company52weeksrange({ companyCode: req.params.companycode });

        companyinfo.yearlow = week52range ? week52range.low : '';
        companyinfo.yearhigh = week52range ? week52range.high : '';

        res.render(__dirname + '/views/companyinfo.ejs', { data: { login: login.login, marketstatu: login.marketstatus, companyinfo, notification: { type: '', message: '' } } });
      }
      catch (e) {
        console.log(e);
        res.render(__dirname + '/views/companyinfo.ejs', { data: { login: login.login, marketstatu: login.marketstatus, notification: { type: 'danger', message: e.message } } });
      }
    });

  app.route('/account')
    .get(authTokenChecker, async (req, res) => {
      try {
        var login = await gettLoggedUserProfile(req, res);

        var useraccount = await dbDataSrvc.getUserAccounts({ userId: login.login.userid });
        var accountrcptpaymnt = await dbDataSrvc.getAccReceiptPayment({ userId: login.login.userid });

        login.login.accTotReceipt = accountrcptpaymnt.map(item => item.rcpamtfloat).reduce((prev, curr) => prev + curr, 0);
        login.login.accTotPayment = accountrcptpaymnt.map(item => item.payamtfloat).reduce((prev, curr) => prev + curr, 0);

        let merged = [];

        for (let i = 0; i < useraccount.length; i++) {
          login.accTotReceipt
          merged.push({
            ...useraccount[i],
            ...(accountrcptpaymnt.find((itmInner) => itmInner.accountid === useraccount[i].id))
          }
          );
        }

        if (res.locals.sessionFlash)
          res.render(__dirname + '/views/account.ejs', { data: { login: login.login, marketstatu: login.marketstatus, useraccount: merged, notification: { type: res.locals.sessionFlash.type, message: res.locals.sessionFlash.message } } });
        else
          res.render(__dirname + '/views/account.ejs', { data: { login: login.login, marketstatu: login.marketstatus, useraccount: merged, notification: { type: '', message: '' } } });
      }
      catch (e) {
        console.log(e);
        res.render(__dirname + '/views/account.ejs', { data: { login: login.login, marketstatu: login.marketstatus, notification: { type: 'danger', message: e.message } } });
      }
    })
    .post(authTokenChecker, async (req, res) => {
      try {
        var login = await gettLoggedUserProfile(req, res);

        console.log(req.body);

        //registerAccount

        if (req.body.accaccountid && req.body.accaccountid !== "" && parseInt(req.body.accaccountid) > 0) {
          // Update existing account
          dbDataSrvc.updateAccount({
            id: parseInt(req.body.accaccountid),
            userid: req.body.accuserid ? req.body.accuserid : login.login.userid,
            fullname: req.body.accfullname.trim(),
            dob: req.body.dob,
            nid: req.body.accnid,
            mobile: req.body.accmobile.trim(),
            bankname: req.body.accbankname,
            bankaccount: req.body.accbankaccount,
            brokercode: req.body.accbrokercode.trim(),
            boaccountno: req.body.accboaccountno,
            boid: req.body.accboid.trim(),
            commissionpct: req.body.acccommissionpct.trim(),
            occupation: req.body.accoccupation,
            isdefault: (req.body.accisdefault && req.body.accisdefault === "1" ? 1 : 0)
          }).then((data) => {
            console.log("Update existing account");
            console.log(data);
            req.session.sessionFlash = {
              type: 'success',
              message: 'Account updated successfully'
            }
          });
        }
        else {

          //Create new account
          dbDataSrvc.registerAccount({
            userid: req.body.accuserid ? req.body.accuserid : login.login.userid,
            fullname: req.body.accfullname.trim(),
            dob: req.body.dob,
            nid: req.body.accnid,
            mobile: req.body.accmobile.trim(),
            bankname: req.body.accbankname,
            bankaccount: req.body.accbankaccount,
            brokercode: req.body.accbrokercode.trim(),
            boaccountno: req.body.accboaccountno,
            boid: req.body.accboid.trim(),
            commissionpct: req.body.acccommissionpct.trim(),
            balance: 0.00,
            occupation: req.body.accoccupation,
            isdefault: (req.body.accisdefault && req.body.accisdefault === "1" ? 1 : 0)
          }).then((data) => {
            console.log("Create new account");
            console.log(data);
            req.session.sessionFlash = {
              type: 'success',
              message: 'Account created successfully'
            }
          });
        }

        res.redirect('/account');
      }
      catch (e) {
        console.log(e);
        req.session.sessionFlash = {
          type: 'danger',
          message: e.message
        }
        res.redirect('/account');
      }
    });

  app.route('/logout')
    .get(async (req, res) => {
      try {
        await doLogout(req, res);
        res.redirect('/');
      }
      catch (err) {
        req.session.sessionFlash = {
          type: 'danger',
          message: err.message
        }
        res.redirect('/');
      }
    });

  app.route('/resetpassword/:token')
    .get(async (req, res) => {
      try {
        var login = await authTokenChecker(req, res);

        var vToken = req.params.token;
        var requser = await checkPasswordResetToken(vToken);

        if (res.locals.sessionFlash)
          res.render(__dirname + '/views/resetpassword.ejs', { data: { login: login, user: requser, token: vToken, notification: { type: res.locals.sessionFlash.type, message: res.locals.sessionFlash.message } } });
        else
          res.render(__dirname + '/views/resetpassword.ejs', { data: { login: login, user: requser, token: vToken, notification: { type: '', message: '' } } });

      }
      catch (e) {
        res.render(__dirname + '/views/resetpassword.ejs', { data: { login: login, user: { user: { email: '' } }, notification: { type: 'danger', message: e } } });
      }

    });

  app.route('/resetpassword')
    .post(async (req, res) => {
      try {
        var vToken = req.body.token;
        var vEmail = req.body.email;
        var vPassword = req.body.password;
        var vConfirmpassword = req.body.confirmpassword;

        var requser = await checkPasswordResetToken(vToken);

        var isreset = await resetPassword(vEmail, vPassword, vConfirmpassword, res);

        if (isreset) {
          req.session.sessionFlash = {
            type: 'success',
            message: 'Password saved successfully'
          }
          res.redirect('/login');
        }
        else {
          req.session.sessionFlash = {
            type: 'danger',
            message: 'Failed to save password'
          }
          res.redirect('/resetpassword/' + vToken);
        }
      }
      catch (e) {
        req.session.sessionFlash = {
          type: 'danger',
          message: e.message
        }
        res.redirect('/resetpassword/' + vToken);
      }

    });

  app.route('/forgetpassword')
    .get((req, res) => {
      if (res.locals.sessionFlash)
        res.render(__dirname + '/views/forgetpassword.ejs', { data: { notification: { type: res.locals.sessionFlash.type, message: res.locals.sessionFlash.message } } });
      else
        res.render(__dirname + '/views/forgetpassword.ejs', { data: { notification: { type: '', message: '' } } });
    })
    .post(async (req, res) => {
      try {
        let isRequest = await forgetPasswordRequest(req.body.email, req.body.memberid);

        if (isRequest) {
          req.session.sessionFlash = {
            type: 'success',
            message: 'Request Sent to your email.'
          }
          res.redirect('/forgetpassword');
        }
      }
      catch (err) {
        console.log(err);
        req.session.sessionFlash = {
          type: 'danger',
          message: err.message
        }
        res.redirect('/forgetpassword');
      }
    });



  //Ajax

  app.route('/transactionsummary')
    .get(authTokenChecker, async (req, res) => {
      try {
        var login = await gettLoggedUserProfile(req, res);
        var grandsummary = await dbDataSrvc.getSumTradeSummary({ userId: login.login.userid, accountId: "" });
        var tradesummary = await dbDataSrvc.getAllAccTradeSummary({ userId: login.login.userid, accountId: "", companyCode: "" });
        var tradesummaryq = await dbDataSrvc.getTradeSummaryQ({ userId: login.login.userid, accountId: "", companyCode: "" });
        var watchlist = await dbDataSrvc.getWatchList({ userId: login.login.userid, accountId: "", companyCode: "" });

        

        res.send({ grandsummary, tradesummary, tradesummaryq, watchlist });
      }
      catch (e) {
        console.log(e);
        res.redirect('/dashboard');
      }

    });

  app.route('/transactionui')
    .get(authTokenChecker, async (req, res) => {
      try {
        var login = await gettLoggedUserProfile(req, res);

        var companylist = await dbDataSrvc.getCompanyNames();
        let useraccount = await dbDataSrvc.getUserAccounts({ userId: login.login.userid });

        res.send({ companylist, useraccount });
      }
      catch (e) {
        console.log(e);
        res.redirect('/dashboard');
      }
    });
  app.route('/getavgcost/:accountid/:companycode')
    .get(authTokenChecker, async (req, res) => {
      try {
        var tradesummary = await dbDataSrvc.getTradeSumObject({ accountId: req.params.accountid, companyCode: req.params.companycode });

        res.send(tradesummary);
      }
      catch (e) {
        console.log(e);
        res.redirect('/dashboard');
      }

    });

  app.route('/companylist')
    .get(authTokenChecker, async (req, res) => {
      try {
        var companylist = await dbDataSrvc.getCompanyNames();

        res.send({ companylist });
      }
      catch (e) {
        console.log(e);
        res.redirect('/dashboard');
      }
    });

  app.route('/brokerlist')
    .get(authTokenChecker, async (req, res) => {
      try {
        var brokerlist = await dbDataSrvc.getBrokerHouses();

        res.send({ brokerlist });
      }
      catch (e) {
        console.log(e);
        res.redirect('/dashboard');
      }
    });

  app.route('/tradehistory1y/:companycode')
    .get(authTokenChecker, async (req, res) => {
      try {
        var tradehist = await dbDataSrvc.getCompanyTradeHistory({ companyCode: req.params.companycode });

        res.send({ tradehist });
      }
      catch (e) {
        console.log(e);
        res.redirect('/dashboard');
      }

    });

  app.route('/transactionhistory')
    .post(authTokenChecker, async (req, res) => {
      try {
        var login = await gettLoggedUserProfile(req, res);

        console.log(req.body);

        var transhist = await dbDataSrvc.getTransHistory({
          userId: login.login.userid, accountId: req.body.data.rptaccount,
          companyCode: req.body.data.rptcompanycode, transType: req.body.data.rpttranytype, 
          startDate: req.body.data.rptstart, endDate: req.body.data.rptend
        });

        res.send({ transhist });
      }
      catch (e) {
        console.log(e);
        res.redirect('/reports');
      }
    });
}   
