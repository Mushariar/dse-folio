import express from 'express'
import bodyParser from "body-parser";
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('express-flash');
const fileUpload = require('express-fileupload');
import cors from 'cors';
var uuidv4 = require('uuid/v4');
//require('dotenv').config({path: __dirname + '/.env'})
require('dotenv').config();

//import { applicationLogger, logger, errorLogger, resultLogger } from "./config/logger";
import logger from "./config/logger";

import route from "./route";

import database from "./models";

//import { SECRET, SESSIONLIFE, SECURED, FORCEINITDB, PORT } from "./config/config";
import appConfig from "./config/config";
import { getIP } from './commonFunctions';

import dseDataProc from './services/dseDataProcessing';
import dbDataSrvc from './services/dbDataService';
var moment = require('moment');

const app = express();

app.use(cors());

app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.json()); // parse form data client
app.use(bodyParser.urlencoded({ extended: true }));


app.use(fileUpload({
  createParentPath: true
})); // configure fileupload
// app.use(bodyParser.text({ type: 'application/json' }));

app.use(cookieParser());

var sessionStore = new session.MemoryStore;
app.use(session({
  cookie: {
    expires: appConfig.SESSIONLIFE,
    secure: false
  },
  store: sessionStore,
  rolling: true,
  saveUninitialized: true,
  resave: 'true',
  secret: appConfig.SECRET
}));



//log for every request
app.use(function (req, res, next) {
  req.start = Date.now();
  req.sessionId = uuidv4();

  //log for every request when it is finished
  // res.on('finish', () => {
  //   let ip = getIP(req);
  //   logger({ip:ip, url:req.originalUrl, sessionId:req.sessionId, statusCode:String(res.statusCode), responseTime:String(new Date() - req.start)});

  // });
  // if there's a flash message in the session request, make it available in the response, then delete it
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;

  next();
});

app.use(flash());

//error log
app.use(function (err, req, res, next) {
  //err = err.toString().replace(/(,|\r\n|\n|\r)/g, '/');
  const [, filename, line, column] = err.stack.match(/\/([\/\w-_\.]+\.js):(\d*):(\d*)/);
  res.status(500);
  let ip = getIP(req);
  logger.errorLogger({ ip: ip, url: req.originalUrl, sessionId: req.sessionId, statusCode: String(res.statusCode), responseTime: String(new Date() - req.start), errorType: err.name, errorMessage: err.message, errorPath: "In " + filename + " at " + line + ":" + column });
  res.send('Oops!!! Something went wrong');
  return next();
});

async function init() {
  try {


    database.sequelize.authenticate().then(async () => {

      await database.sequelize.sync({ force: appConfig.FORCEINITDB === 'true' });

      //await publicroute(app);
      await route(app);

      if (appConfig.SECURED === 'true') {
        https.createServer(options, app).listen(appConfig.PORT, () => {
          console.log(
            `[🚀] Database and Application ready to accept SSL connections on ${appConfig.PORT}`
          );
        });
      } else {
        app.listen(appConfig.PORT, () => {

          console.log(
            `[🚀] Database and Application ready to accept connections on ${appConfig.PORT}`
          );
        });
      }
    })
      .catch((err) => {
        console.log(err);
        throw (err.message);
      });
  }
  catch (ex) {
    logger.applicationLogger(ex.stack);
    console.log(ex);
  }
}




// dbAccessConfig.getCompanyNames().then((data)=>{
//   console.log(data);
//   });

// dbAccessConfig.getCompCurrentPrice("BDCOM").then((data)=>{
// console.log(data);
// });


// dbAccessConfig.getCompanyTransHistory("BDCOM", "2020-09-06", "2020-09-08").then((data)=>{
// console.log(data);
// });


// dbAccessConfig.updateAccount(
//   {
//     id:1,
//     userid: 1,
//     fullname: "Mushariar Ahmmed",
//     dob: "1984-01-20",
//     //nid: DataTypes.STRING,
//     mobile: "01713453778",
//     bankname: "UCB",
//     //bankaccount: DataTypes.STRING,
//     brokercode: "DSELAN",
//     boaccountno: "1201830069177076",
//     boid: "Y3176",
//     commissionpct: 100,
//     balance: 0.00,
//     occupation: "Service"
//   }
//   ).then((data)=>{
// console.log(data);
// });
/*
Buy	LANKABAFIN	1000	 12.90 	 12,900.00 	  	 51.60 	 58,917.79 
Buy	LANKABAFIN	1000	 13.30 	 13,300.00 	  	 53.20 	 (30,259.11)
Sale	LANKABAFIN	700	 17.33 	  	 12,131.00 	 48.52 	 138,807.21 
Buy	LANKABAFIN	200	 17.10 	 3,420.00 	  	 13.68 	 35,373.53 
*/
/*
Buy	EXIM1STMF	450	 5.90 	 2,655.00 	  	 10.62 	 129,796.19 
Buy	EXIM1STMF	400	 5.40 	 2,160.00 	  	 10.00 	 118,207.62 
Sale	EXIM1STMF	850	 6.70 	  	 5,695.00 	 22.78 	 141,081.93 

Buy	UNITEDFIN	1000	 12.55 	 12,550.00 	  	 50.20 	 21,748.09 
*/

// dbDataSrvc.transactionEntry(
//   {
//     accountid: 3,
//     transdate: "2020-08-30",
//     transtype: "BUY",
//     companycode: "UNITEDFIN",
//      quantity: 100,
//     rate:    10,
//     commission: 4,
//     amount:  (100*10) + 4,
//     avgcost: 0,
//     dividendpct: 0,
//     comments: ''
//   }
// ).then((data) => {
//   console.log(data);
// });

// dbAccessConfig.getUserAccounts({userId: 1}).then((data)=>{
// console.log(data);
// });

// dbAccessConfig.getUserTransHist({accountId: 1, startDate: "2020-08-06", endDate: "2020-09-10"}).then((data)=>{
// console.log(data);
// });

// dbDataSrvc.getTradeSummary({userId: 2, accountId:'3', companyCode: "UNITEDFIN"}).then((data)=>{
// data.forEach((item, i)=>{
//   console.log("item");
//   console.log(item);
//   item.trade_summaries.forEach((ts, i)=>{
//     console.log("trade_summaries");
//     console.log(ts);
//     //console.log(ts.company);
//   });
// })
// });

// dbDataSrvc.getTransDetails({userId: 1, accountId: 1, startDate: "2020-09-01", endDate: "2020-09-10"}).then((data)=>{
// console.log(data);
//  //console.log(data[0].transaction_histories);
// });

// dbDataSrvc.getTransSummary({userId: 1, accountId: 1, startDate: "2020-09-01", endDate: "2020-09-10"}).then((data)=>{
// console.log(data);
//  console.log(data[0].transaction_histories);
// });

// dbDataSrvc.getSumTradeSummary({userId: 1, accountId: ''}).then((data)=>{
// console.log(data);
// });


  init();

dseDataProc();