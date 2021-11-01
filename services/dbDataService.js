var Sequelize = require('sequelize');
require('sequelize-values')(Sequelize);
const { Op } = require("sequelize");
import _ from 'lodash';
import moment from 'moment';
import { getSqlQueryResult } from "./dbfunctions";
import models from "../models";
//var mail = require('../utl/email/mailerWithTemp');

var functions = {};

functions.maxArchieveDate = () => {
  return models.archievedPrices.findOne({
    attributes: [
      [Sequelize.fn('MAX', Sequelize.col('transdate')), 'maxdate'],
    ]
  })
    .then(function (data) {
      return data.getValues();
    }).catch(function (err) {
      console.log('Oops! something went wrong, : ', err);
    });
}

functions.getUpdateStatus = () => {
  return models.updateStatus.findAll({
  }).then(function (UpdateStatus) {
    return Sequelize.getValues(UpdateStatus);
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

functions.getIdxUpdateStatus = (p) => {
  return models.updateStatus.findOne({
    where: { updtindex: p.updtindex }
  }).then(function (UpdateStatus) {
    return UpdateStatus.getValues();
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

functions.getBrokerHouses = () => {
  return models.brokerHouses.findAll({
    attributes: ['holderno', 'brokercode', 'brokername']
  }).then(function (brokerHouses) {
    return Sequelize.getValues(brokerHouses);
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

functions.getCompanyNames = () => {
  return models.companies.findAll({
    attributes: ['companycode', 'comapnyname']
  }).then(function (companies) {
    return Sequelize.getValues(companies);
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

functions.getCompanyList = () => {
  return models.companies.findAll({
  }).then(function (companies) {
    return Sequelize.getValues(companies);
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

functions.getCompanyInfo = (p) => {
  p.companyCode = (!p.companyCode ? null : p.companyCode.toUpperCase());
  return models.companies.findOne({
    where: { companycode: p.companyCode },
    include: [{
      model: models.currentprices,
      attributes: ['ltp', 'high', 'low', 'clsp', 'ycp', 'change', 'trade', 'valuemn', 'volume'],
      required: false
    }]
  }).then(function (companies) {
    return companies.getValues();
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

functions.getCompanyTradeHistory = (p) => {
  p.companyCode = (!p.companyCode ? null : p.companyCode.toUpperCase());

  p.startDate = (!p.startDate || p.startDate === '' ? moment().add(-1, 'years').format('YYYY-MM-DD') : p.startDate);
  p.endDate = (!p.endDate || p.endDate === '' ? moment().format('YYYY-MM-DD') : p.endDate);
  

  return models.companies.findOne({
    where: { companycode: p.companyCode },
    include: [{
      model: models.archievedPrices,
      attributes: ['transdate', 'ltp', 'high', 'low', 'opnp', 'clsp', 'ycp', 'trade', 'valuemn', 'volume'],
      where: {
        transdate: {
          [Op.between]: [p.startDate, p.endDate]
        }
      },
      required: false
    }]
  }).then(function (companies) {
    return companies.getValues();
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

functions.getUserAccounts = (p) => {
  return models.accountRegistration.findAll({
    where: { userid: p.userId },
    include: [{
      model: models.brokerHouses,
      attributes: ['brokercode', 'brokername'],
      required: false
    }]
  }).then(function (brokerHouses) {
    return Sequelize.getValues(brokerHouses);
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

functions.getUserAccountList = (p) => {
  return models.accountRegistration.findAll({
    attributes: ['id', 'userid', 'boid', 'balance', 'commissionpct'],
    where: { userid: p.userId },
    include: [{
      model: models.brokerHouses,
      attributes: ['brokercode', 'brokername'],
      required: false
    }]
  }).then(function (brokerHouses) {
    return Sequelize.getValues(brokerHouses);
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

functions.getAllCurrentPrice = () => {

  return models.currentprices.findAll({
    include: [{
      model: models.companies,
      attributes: ['comapnyname'],
      required: false
    }]
  }).then((currentprices) => {
    return Sequelize.getValues(currentprices);

  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

functions.getCompCurrentPrice = (p) => {
  p.companyCode = (!p.companyCode ? null : p.companyCode.toUpperCase());
  return models.currentprices.findOne({
    where: { companycode: p.companyCode },
    include: [{
      model: models.companies,
      attributes: ['comapnyname'],
      required: false
    }]
  }).then((currentprice) => {
    return currentprice.getValues();
  }).catch((err) => {
    console.log('Oops! something went wrong, : ', err);
  });
}

functions.registerAccount = (data) => {

  data.dob = (!data.dob || data.dob === '' ? null : data.dob);
  data.commissionpct = (!data.commissionpct || data.commissionpct === '' ? 0.00 : data.commissionpct);
  data.balance = (!data.balance || data.balance === '' ? 0.00 : data.balance);

  return models.accountRegistration.create(data)
    .then((accReg) => {
      return accReg.getValues();
    }).catch((err) => {
      console.log('Oops! something went wrong, : ', err);
    });
}

functions.updateAccount = (data) => {

  let accWhere = {}
  
  if (data.id && data.id !== '') {
    accWhere.id = data.id;

    if (data.userid && data.userid !== '')
      accWhere.userid = data.userid;

  }
  else {
    throw new Error('An error occured');
  }

  return models.accountRegistration.findOne({ where: accWhere })
    .then((acc) => {

      if (!acc) {
        throw new Error('Account not found');
      }

      data.dob = (!data.dob || data.dob === '' ? null : data.dob);
      data.commissionpct = (!data.commissionpct || data.commissionpct === '' ? acc.commissionpct : data.commissionpct);
      //data.balance = (!data.balance || data.balance === '' ? 0.00 : data.balance);

      //donot let user to update balance
      data.balance = acc.balance;

      return acc.update(data).then((updatedAcc) => {
        return updatedAcc.getValues();
      });
    })
    .catch((err) => {
      // do seomthing with the error
      console.log('Oops! something went wrong, : ', err);
      throw new Error(err);
    });

}

functions.transactionEntry = async (data) => {

  try {
    let isSummary = true;
    let isAccount = true;
    data.companycode = (!data.companycode ? null : data.companycode.toUpperCase());
    data.quantity = (!data.quantity || data.quantity === '' ? 0 : parseInt(data.quantity));
    data.rate = (!data.rate || data.rate === '' ? 0.00 : parseFloat(data.rate));
    data.commission = (!data.commission || data.commission === '' ? 0.00 : parseFloat(data.commission));
    data.amount = (!data.amount || data.amount === '' ? 0.00 : parseFloat(data.amount));
    data.avgcost = (!data.avgcost || data.avgcost === '' ? 0.00 : parseFloat(data.avgcost));
    data.dividendpct = (!data.dividendpct || data.dividendpct === '' ? 0.00 : parseFloat(data.dividendpct));
    data.comments = (!data.comments ? '' : data.comments);

    let trxData = _.pick(data, ['accountid', 'transdate', 'transtype', 'companycode', 'comments']);
    trxData.dividendpct = 0;
    trxData.plusquantity = 0;
    trxData.minusquantity = 0;
    trxData.rate = 0;
    trxData.totalprice = 0;
    trxData.commission = 0;
    trxData.debitamount = 0;
    trxData.creditamount = 0;
    trxData.avgcost = 0;
    trxData.totalcost = 0;
    trxData.realizedprofit = 0;
    trxData.cashdivident = 0;
    trxData.stockdivident = 0;

    //data.amount is exclusive commission

    switch (data.transtype) {
      case "BUY":
        trxData.plusquantity = data.quantity;
        trxData.rate = data.rate;
        trxData.totalprice = (data.quantity * data.rate);
        trxData.commission = data.commission;
        trxData.debitamount = trxData.totalprice + trxData.commission; //data.amount;  
        trxData.totalcost = trxData.debitamount;
        break;
      case "SALE":
        trxData.minusquantity = data.quantity;
        trxData.rate = data.rate;
        trxData.totalprice = data.quantity * data.rate;
        trxData.commission = data.commission;
        trxData.creditamount = trxData.totalprice - trxData.commission;//data.amount;
        trxData.avgcost = data.avgcost;
        trxData.totalcost = data.quantity * data.avgcost;
        trxData.realizedprofit = trxData.creditamount - trxData.totalcost;
        break;
      case "RECEIPT":
        trxData.creditamount = data.amount;
        isSummary = false;
        break;
      case "PAYMENT":
        trxData.debitamount = data.amount;
        isSummary = false;
        break;
      case "CASH DIVIDENT":
        trxData.dividendpct = data.dividendpct;
        trxData.realizedprofit = data.amount;
        trxData.cashdivident = data.amount;
        isAccount = false;
        break;
      case "STOCK DIVIDENT":
        trxData.plusquantity = data.quantity;
        trxData.dividendpct = data.dividendpct;
        trxData.stockdivident = data.quantity;
        isAccount = false;
        break;
      case "RIGHT SHARE":
        trxData.plusquantity = data.quantity;
        trxData.rate = data.rate;
        trxData.totalprice = data.quantity * data.rate;
        trxData.commission = data.commission;
        trxData.debitamount = trxData.totalprice + trxData.commission; //data.amount;
        trxData.totalcost = trxData.debitamount;
        break;
      default:
        throw new Error('Undefined Transaction Type');
    };

    var sequelize = models.sequelize;

    return await sequelize.transaction(async (t) => {

      var acc = await models.accountRegistration.findOne({ where: { id: trxData.accountid } }, { transaction: t });

      if (!acc) {
        throw new Error('Account Not Found');
      }

      if (isSummary) {
        //Get existing trade summary

        var trdSum = await models.tradeSummary.findOne({ where: { [Op.and]: [{ accountid: trxData.accountid }, { companycode: trxData.companycode }] } }, { transaction: t });

        if (!trdSum) {
          //Insert
          await models.tradeSummary.create({
            accountid: trxData.accountid,
            companycode: trxData.companycode,
            stockquantity: trxData.plusquantity,
            totalcost: trxData.debitamount,
            totalcommission: trxData.commission,
            targetrate: trxData.targetrate,
          }, { transaction: t });
        }
        else {
          //Update 
          let trdSm = {};
          trdSm.stockquantity = Sequelize.literal('stockquantity + ' + trxData.plusquantity + ' - ' + trxData.minusquantity);
          trdSm.totalcost = (trxData.plusquantity > 0 ? Sequelize.literal('totalcost + ' + trxData.totalcost) : Sequelize.literal('totalcost - ' + trxData.totalcost));
          trdSm.salequantity = Sequelize.literal('salequantity + ' + trxData.minusquantity);
          trdSm.saleamount = (trxData.minusquantity > 0 ? Sequelize.literal('saleamount + ' + trxData.creditamount) : Sequelize.literal('saleamount + 0 '));
          trdSm.totalcommission = Sequelize.literal('totalcommission + ' + trxData.commission);
          trdSm.realizedprofit = Sequelize.literal('realizedprofit + ' + trxData.realizedprofit);
          trdSm.cashdivident = Sequelize.literal('cashdivident + ' + trxData.cashdivident);
          trdSm.stockdivident = Sequelize.literal('stockdivident + ' + trxData.stockdivident);
          trdSm.targetrate = trxData.targetrate;

          await trdSum.update(trdSm, { transaction: t });
        }
      }

      if (isAccount) {
        trxData.availablebalance = acc.balance + trxData.creditamount - trxData.debitamount;
      }

      var completedTrx = await models.transactionHistory.create(trxData, { transaction: t });

      if (isAccount) {
        //Update Account Balance
        await acc.update({
          balance: Sequelize.literal('balance + ' + trxData.creditamount + ' - ' + trxData.debitamount)
        }, { transaction: t });
      }

      console.log(completedTrx.getValues());
      return true;//completedTrx.getValues();


    })
      .catch((err) => {
        // do seomthing with the error
        console.log('Oops! Failed to create transaction, : ', err);
        throw new Error(err)
      });

  } catch (err) {

    // If the execution reaches this line, an error occurred.
    // The transaction has already been rolled back automatically by Sequelize!
    console.log('Oops! something went wrong, : ', err);
    throw new Error(err);

  }
}

functions.getTransDetails = (p) => {

  let accWhere = {}
  let thWhere = {};
  if (!p.userId || p.userId === '') {
    throw new Error('An error occured');
  }
  else {
    accWhere.userid = p.userId;
  }

  if (p.accountId && p.accountId !== '') {
    accWhere.id = p.accountId;
  }

  if (p.companyCode && p.companyCode !== '') {
    thWhere.companycode = p.companyCode.toUpperCase();
  }

  p.startDate = (!p.startDate || p.startDate === '' ? moment().startOf('year').format('YYYY-MM-DD') : p.startDate);
  p.endDate = (!p.endDate || p.endDate === '' ? moment().format('YYYY-MM-DD') : p.endDate);
  thWhere.transdate = {
    [Op.between]: [p.startDate, p.endDate]
  }



  return models.accountRegistration.findAll({
    where: accWhere,
    attributes: ['userid', 'id', 'boid', 'fullname', 'balance'],
    include: [{
      model: models.brokerHouses,
      attributes: ['brokercode', 'brokername'],
      required: false
    },
    {

      model: models.transactionHistory,
      attributes: ['companycode', 'transtype', 'transdate', 'dividendpct', 'rate', 'totalprice',
        'commission', 'availablebalance', 'realizedprofit', 'comments',
        [Sequelize.fn('ROUND', Sequelize.literal('if(`transaction_histories`.plusquantity > 0, `transaction_histories`.plusquantity, `transaction_histories`.minusquantity)'), 2), 'quantity'],
        [Sequelize.fn('ROUND', Sequelize.literal('if(`transaction_histories`.debitamount > 0, `transaction_histories`.debitamount, `transaction_histories`.creditamount)'), 2), 'amount'],
      ],
      required: false,
      where: thWhere,
      include: [{
        model: models.companies,
        attributes: ['comapnyname'],
        required: false
      }]
    }
    ]
  }).then(function (trxsum) {
    return Sequelize.getValues(trxsum);
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}


functions.getTransSummary = (p) => {

  let accWhere = {}
  let thWhere = {};
  if (!p.userId || p.userId === '') {
    throw new Error('An error occured');
  }
  else {
    accWhere.userid = p.userId;
  }

  if (p.accountId && p.accountId !== '') {
    accWhere.id = p.accountId;
  }

  if (p.companyCode && p.companyCode !== '') {
    thWhere.companycode = p.companyCode.toUpperCase();
  }

  p.startDate = (!p.startDate || p.startDate === '' ? moment().startOf('year').format('YYYY-MM-DD') : p.startDate);
  p.endDate = (!p.endDate || p.endDate === '' ? moment().format('YYYY-MM-DD') : p.endDate);
  thWhere.transdate = {
    [Op.between]: [p.startDate, p.endDate]
  }



  return models.accountRegistration.findAll({
    raw: true,
    where: accWhere,
    order: [
      ['id', 'DESC']
    ],
    attributes: ['userid', 'boid', 'fullname', 'brokercode', 'broker_house.brokername', 'transaction_histories.companycode', 'transaction_histories.company.comapnyname',
      [Sequelize.fn('ROUND', Sequelize.literal('SUM(if(`transaction_histories`.`transtype` IN ("BUY","RIGHT SHARE") , if(`transaction_histories`.`plusquantity` > 0, `transaction_histories`.`plusquantity`, `transaction_histories`.`minusquantity`) , 0 ))'), 2), 'buyquantity'],
      [Sequelize.fn('ROUND', Sequelize.literal('SUM(if(`transaction_histories`.`transtype` = "STOCK DIVIDENT", if(`transaction_histories`.`plusquantity` > 0, `transaction_histories`.`plusquantity`, `transaction_histories`.`minusquantity`), 0))'), 2), 'stockdivquantity'],
      [Sequelize.fn('ROUND', Sequelize.literal('SUM(if(`transaction_histories`.`transtype` = "SALE", if(`transaction_histories`.`plusquantity` > 0, `transaction_histories`.`plusquantity`, `transaction_histories`.`minusquantity`), 0))'), 2), 'salequantity'],
      [Sequelize.fn('ROUND', Sequelize.literal('SUM(if(`transaction_histories`.`transtype` IN ("BUY" or "RIGHT SHARE"), `transaction_histories`.`totalprice`, 0))'), 2), 'totbuyprice'],
      [Sequelize.fn('ROUND', Sequelize.literal('SUM(if(`transaction_histories`.`transtype` = "SALE", `transaction_histories`.`totalprice`, 0))'), 2), 'totsaleprice'],
      [Sequelize.fn('ROUND', Sequelize.literal('SUM(`transaction_histories`.`commission`)'), 2), 'commission'],
      [Sequelize.fn('ROUND', Sequelize.literal('SUM(if(`transaction_histories`.`transtype` IN ("BUY","RIGHT SHARE") , if(`transaction_histories`.`debitamount` > 0, `transaction_histories`.`debitamount`, `transaction_histories`.`creditamount`) , 0 ))'), 2), 'buyamount'],
      [Sequelize.fn('ROUND', Sequelize.literal('SUM(if(`transaction_histories`.`transtype` = "SALE", if(`transaction_histories`.`debitamount` > 0, `transaction_histories`.`debitamount`, `transaction_histories`.`creditamount`), 0))'), 2), 'saleamount'],
      [Sequelize.fn('ROUND', Sequelize.literal('SUM(if(`transaction_histories`.`transtype` = "RECEIPT", if(`transaction_histories`.`debitamount` > 0, `transaction_histories`.`debitamount`, `transaction_histories`.`creditamount`), 0))'), 2), 'rcpamount'],
      [Sequelize.fn('ROUND', Sequelize.literal('SUM(if(`transaction_histories`.`transtype` = "PAYMENT", if(`transaction_histories`.`debitamount` > 0, `transaction_histories`.`debitamount`, `transaction_histories`.`creditamount`), 0))'), 2), 'payamount'],
      [Sequelize.fn('ROUND', Sequelize.literal('SUM(if(`transaction_histories`.`transtype` = "CASH DIVIDENT", if(`transaction_histories`.`debitamount` > 0, `transaction_histories`.`debitamount`, `transaction_histories`.`creditamount`), 0))'), 2), 'cashdivamount'],
      [Sequelize.fn('ROUND', Sequelize.literal('SUM(if(`transaction_histories`.`transtype` IN ("SALE" or "CASH DIVIDENT"), `transaction_histories`.`realizedprofit`, 0))'), 2), 'totrealizedprofit']
    ],
    include: [{
      model: models.brokerHouses,
      attributes: [],
      required: false
    },
    {
      model: models.transactionHistory,
      attributes: [],
      required: false,
      where: thWhere,
      include: [{
        model: models.companies,
        attributes: [],
        required: false
      }]
    }
    ],
    group: ['account_registration.userid', 'account_registration.boid', 'account_registration.fullname', 'broker_house.brokercode', 'broker_house.brokername', 'transaction_histories.companycode', '`transaction_histories->company`.comapnyname']

  }).then(function (trxsum) {
    return trxsum;
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

functions.getTradeSummary = (p) => {

  let accWhere = {}
  let tsWhere = {};
  if (!p.userId || p.userId === '') {
    throw new Error('An error occured');
  }
  else {
    accWhere.userid = p.userId;
  }
  if (p.accountId && p.accountId !== '') {
    accWhere.id = p.accountId;
  }

  if (p.companyCode && p.companyCode !== '') {
    tsWhere.companycode = p.companyCode.toUpperCase();
  }

  return models.accountRegistration.findAll({
    where: accWhere,
    attributes: ['userid', 'id', 'boid', 'fullname', 'balance'],
    include: [{
      model: models.brokerHouses,
      attributes: ['brokercode', 'brokername'],
      required: false
    },
    {
      model: models.tradeSummary,
      attributes: ['companycode', 'stockquantity', 'totalcost', 'avgcost', 'salequantity', 'saleamount', 'totalcommission', 'realizedprofit', 'stockdivident', 'cashdivident', 'targetrate',
        //[Sequelize.fn('ROUND', Sequelize.literal('`trade_summaries`.totalcost / `trade_summaries`.stockquantity'),2), 'avgcost'],
        [Sequelize.fn('ROUND', Sequelize.literal('if(`trade_summaries->company->currentprice`.clsp > 0, `trade_summaries->company->currentprice`.clsp, if(`trade_summaries->company->currentprice`.ltp > 0, `trade_summaries->company->currentprice`.ltp, `trade_summaries->company->currentprice`.ycp))'), 2), 'marketprice'],
        [Sequelize.fn('ROUND', Sequelize.literal('`trade_summaries`.stockquantity * if(`trade_summaries->company->currentprice`.clsp > 0, `trade_summaries->company->currentprice`.clsp, if(`trade_summaries->company->currentprice`.ltp > 0, `trade_summaries->company->currentprice`.ltp, `trade_summaries->company->currentprice`.ycp))'), 2), 'marketvalue'],
        [Sequelize.fn('ROUND', Sequelize.literal('(`trade_summaries`.stockquantity * if(`trade_summaries->company->currentprice`.clsp > 0, `trade_summaries->company->currentprice`.clsp, if(`trade_summaries->company->currentprice`.ltp > 0, `trade_summaries->company->currentprice`.ltp, `trade_summaries->company->currentprice`.ycp))) - `trade_summaries`.totalcost'), 2), 'unrealizeprofit']
      ],
      required: false,
      where: tsWhere,
      include: [{
        model: models.companies,
        attributes: ['comapnyname'],
        required: false,
        include: [{
          model: models.currentprices,
          attributes: [],
          required: false
        }]
      }]
    }
    ]
  }).then(function (trxsum) {
    return Sequelize.getValues(trxsum);
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

functions.getTradeSumObject = (p) => {

  if (!p.accountId || p.accountId === '' || !p.companyCode || p.companyCode === '') {
    throw new Error('An error occured');
  }


  return models.tradeSummary.findOne({
    where: { accountid: p.accountId, companycode: p.companyCode.toUpperCase() }
  }).then(function (companies) {
    return companies.getValues();
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

functions.getSumTradeSummary = (p) => {

  if (!p.userId || p.userId === '') {
    throw new Error('An error occured');
  }
  p.accountId = (!p.accountId ? null : p.accountId);

  const dynamicSearch = `SELECT
                              count(DISTINCT ts.accountid ) as account,
                              count(DISTINCT ts.companycode) as company,
                              sum(ts.stockquantity) as totalstock,
                              round(sum(ts.totalcost), 2) as totalcost,
                              round(sum(ts.totalcost)/sum(ts.stockquantity), 2) as avgcost,
                              sum(ts.salequantity) as soldstock,
                              round(sum(ts.saleamount), 2) as soldamount,
                              round(sum(if(cp.clsp>0,cp.clsp,if(cp.ltp>0,cp.ltp,cp.ycp)) * ts.stockquantity), 2) as marketvalue,
                              round(sum(ts.stockquantity * if(cp.clsp>0,cp.clsp,if(cp.ltp>0,cp.ltp,cp.ycp))) - sum(ts.totalcost), 2) as unrealizedprofit,
                              round(sum(ts.realizedprofit), 2) as realizedprofit
                            FROM
                              trade_summaries ts, account_registrations ar, companies c, currentprices cp
                            where ar.id = ts.accountid 
                            and ts.companycode = c.companycode 
                            and c.companycode = cp.companycode 
                            and ar.userid = :userid
                            and (ar.id = :accountid or :accountid is null)`;

  var bindVars = {
    userid: p.userId,
    accountid: p.accountId
  };

  return getSqlQueryResult(dynamicSearch, bindVars, models)
    .then(function (result) {
      return result[0];
    }).catch(function (e) {
      console.log(e);
      throw e;
    });
}

functions.getTradeSummaryQ = (p) => {

  if (!p.userId || p.userId === '') {
    throw new Error('An error occured');
  }
  p.accountId = (!p.accountId ? null : p.accountId);


  const dynamicSearch = `SELECT
                              ar.boid, 
                              bh.brokername,
                              ts.companycode,
                              c.comapnyname,
                              c.category ,
                              c.sector, 
                              sum(ts.stockquantity) as totalstock,
                              round(sum(ts.totalcost), 2) as totalcost,
                              round(sum(ts.totalcost)/sum(ts.stockquantity), 2) as avgcost,
                              sum(ts.salequantity) as soldstock,
                              round(sum(ts.saleamount), 2) as soldamount,
                              if(cp.clsp>0,cp.clsp,if(cp.ltp>0,cp.ltp,cp.ycp)) as marketprice,
                              round(sum(if(cp.clsp>0,cp.clsp,if(cp.ltp>0,cp.ltp,cp.ycp)) * ts.stockquantity), 2) as marketvalue,
                              round(sum(ts.stockquantity * if(cp.clsp>0,cp.clsp,if(cp.ltp>0,cp.ltp,cp.ycp))) - sum(ts.totalcost), 2) as unrealizedprofit,
                              round(sum(ts.totalcommission), 2) as totalcommission,
                              round(sum(ts.realizedprofit), 2) as realizedprofit
                            FROM
                              trade_summaries ts, account_registrations ar, companies c, currentprices cp, broker_houses bh 
                            where ar.id = ts.accountid 
                            and ar.brokercode = bh.brokercode 
                            and ts.companycode = c.companycode 
                            and c.companycode = cp.companycode 
                            and ar.userid = :userid
                            and (ar.id = :accountid or :accountid is null)     
                            group by ar.boid, bh.brokercode, ts.companycode, ts.updatedAt 
                            order by ts.updatedAt desc`;

  var bindVars = {
    userid: p.userId,
    accountid: p.accountId
  };

  return getSqlQueryResult(dynamicSearch, bindVars, models)
    .then(function (result) {
      return result;
    }).catch(function (e) {
      throw e;
    });
}

functions.getAllAccTradeSummary = (p) => {

  if (!p.userId || p.userId === '') {
    throw new Error('An error occured');
  }
  p.accountId = (!p.accountId ? null : p.accountId);

  const dynamicSearch = `SELECT
                              ts.companycode,
                              c.comapnyname,
                              c.category ,
                              c.sector,
                              sum(ts.stockquantity) as totalstock,
                              round(sum(ts.totalcost), 2) as totalcost,
                              round(sum(ts.totalcost)/sum(ts.stockquantity), 2) as avgcost,
                              sum(ts.salequantity) as soldstock,
                              round(sum(ts.saleamount), 2) as soldamount,
                              if(cp.clsp>0,cp.clsp,if(cp.ltp>0,cp.ltp,cp.ycp)) as marketprice,
                              round(sum(if(cp.clsp>0,cp.clsp,if(cp.ltp>0,cp.ltp,cp.ycp)) * ts.stockquantity), 2) as marketvalue,
                              round(sum(ts.stockquantity * if(cp.clsp>0,cp.clsp,if(cp.ltp>0,cp.ltp,cp.ycp))) - sum(ts.totalcost), 2) as unrealizedprofit,
                              round(sum(ts.totalcommission), 2) as totalcommission,
                              round(sum(ts.realizedprofit), 2) as realizedprofit
                            FROM
                              trade_summaries ts, account_registrations ar, companies c, currentprices cp
                            where ar.id = ts.accountid 
                            and ts.companycode = c.companycode 
                            and c.companycode = cp.companycode 
                            and ar.userid = :userid
                            and (ar.id = :accountid or :accountid is null)     
                            group by ts.companycode
                            `;

  var bindVars = {
    userid: p.userId,
    accountid: p.accountId
  };

  return getSqlQueryResult(dynamicSearch, bindVars, models)
    .then(function (result) {
      return result;
    }).catch(function (e) {
      throw e;
    });
}

functions.getWatchList = (p) => {

  if (!p.userId || p.userId === '') {
    throw new Error('An error occured');
  }
  p.accountId = (!p.accountId ? null : p.accountId);

  const dynamicSearch = `SELECT
                              ts.companycode,
                              c.comapnyname,
                              c.category ,
                              c.sector,
                              cp.ltp,
                              cp.high,
                              cp.low,
                              cp.clsp,
                              cp.ycp,
                              cp.trade,
                              cp.valuemn,
                              cp.volume,
                              format(cp.clsp-cp.ycp, 2) as changeamt,
                              format((cp.clsp-cp.ycp)/ cp.ycp*100, 2) as changepct
                            FROM
                              trade_summaries ts,
                              account_registrations ar,
                              companies c,
                              currentprices cp
                            where
                              ar.id = ts.accountid
                              and ts.companycode = c.companycode
                              and c.companycode = cp.companycode
                              and ts.stockquantity > 0
                              and ar.userid = :userid
                              and (ar.id = :accountid or :accountid is null)`;

  var bindVars = {
    userid: p.userId,
    accountid: p.accountId
  };

  return getSqlQueryResult(dynamicSearch, bindVars, models)
    .then(function (result) {
      return result;
    }).catch(function (e) {
      throw e;
    });
}

functions.getAccReceiptPayment = (p) => {

  if (!p.userId || p.userId === '') {
    throw new Error('An error occured');
  }
  p.accountId = (!p.accountId ? null : p.accountId);

  const dynamicSearch = `select
                              th.accountid ,
                              format(sum(th.debitamount),2) paymentamount,
                              format(sum(th.creditamount),2) as receiptamount,
                              sum(th.debitamount) payamtfloat,
                              sum(th.creditamount) as rcpamtfloat
                            from
                              xmandb.transaction_history th,
                              account_registrations ar
                            where
                              th.accountid = ar.id
                              and ar.userid = :userid
                              and (ar.id = :accountid
                              or :accountid is null)
                              and th.transtype in ('RECEIPT',
                              'PAYMENT')
                            GROUP by
                              th.accountid`;

  var bindVars = {
    userid: p.userId,
    accountid: p.accountId
  };

  return getSqlQueryResult(dynamicSearch, bindVars, models)
    .then(function (result) {
      return result;
    }).catch(function (e) {
      throw e;
    });
}

functions.company52weeksrange = (p) => {

  if (!p.companyCode || p.companyCode === '') {
    throw new Error('An error occured');
  }


  const dynamicSearch = `select t.companycode, max(t.high) high, min(t.low) low from (
                                select cp.companycode, CAST(REPLACE(cp.high,',','') AS DECIMAL(10,2)) as high, CAST(REPLACE(cp.low,',','') AS DECIMAL(10,2)) as low
                                from currentprices cp 
                                where cp.companycode = :companycode
                                and CAST(REPLACE(cp.high,',','') AS DECIMAL(10,2)) > 0
                                and CAST(REPLACE(cp.low,',','') AS DECIMAL(10,2)) > 0
                                union all
                                select companycode, CAST(REPLACE(ap.high,',','') AS DECIMAL(10,2)) as high, CAST(REPLACE(ap.low,',','') AS DECIMAL(10,2)) as low
                                from archieved_prices ap 
                                where ap.companycode = :companycode
                                and CAST(REPLACE(ap.high,',','') AS DECIMAL(10,2)) > 0
                                and CAST(REPLACE(ap.low,',','') AS DECIMAL(10,2)) > 0
                                and transdate > DATE_ADD(now(), INTERVAL -52 WEEK) 
                                ) t
                                group by t.companycode`;

  var bindVars = {
    companycode: p.companyCode
  };

  return getSqlQueryResult(dynamicSearch, bindVars, models)
    .then(function (result) {
      return result[0];
    }).catch(function (e) {
      throw e;
    });
}

functions.getTransHistory = (p) => {

  if (!p.userId || p.userId === '') {
    throw new Error('An error occured');
  }

  console.log(p);

  p.accountId = (!p.accountId || p.accountId === '' ? null : p.accountId);
  p.companyCode = (!p.companyCode || p.companyCode === '' ? null : p.companyCode);
  p.transType = (!p.transType || p.transType === '' ? null : p.transType);
  p.startDate = (!p.startDate || p.startDate === '' ? moment().startOf('year').format('YYYY-MM-DD') : p.startDate);
  p.endDate = (!p.endDate || p.endDate === '' ? moment().format('YYYY-MM-DD') : p.endDate);


  const dynamicSearch = `select
                              th.transdate,
                              ar.boid,
                              th.transtype,
                              th.companycode,
                              c.comapnyname ,
                              c.sector,
                              if(th.plusquantity > 0, th.plusquantity, th.minusquantity) quantity,
                              th.rate,
                              th.totalprice,
                              th.commission,
                              if(th.debitamount > 0, th.debitamount, th.creditamount) amount,
                              th.availablebalance as edingbalance,
                              th.comments
                            from
                              transaction_history th
                              LEFT OUTER JOIN companies c
                              ON th.companycode = c.companycode,
                              account_registrations ar
                            where
                              th.accountid = ar.id
                              and ar.userid = :userid
                              and (ar.id = :accountid or :accountid is null)
                              and th.transdate between :startdate and :enddate
                              and  (th.companycode = :companycode or :companycode is null)
                              and  (th.transtype = :transtype or :transtype is null)
                              order by th.transdate desc, th.id desc, th.companycode `;

  var bindVars = {
    userid: p.userId,
    accountid: p.accountId,
    companycode: p.companyCode,
    transtype: p.transType,
    startdate: p.startDate,
    enddate: p.endDate
  };

  return getSqlQueryResult(dynamicSearch, bindVars, models)
    .then(function (result) {
      return result;
    }).catch(function (e) {
      throw e;
    });



}


const getMemberId = async (membertype) => {

  const dynamicSearch = `SELECT CONCAT(:membertype, LPAD(IFNULL(max(substring_index(substring(memberid, 3), \'/\', 1)), 0) + 1, 4, '0'), \'/\', YEAR(CURDATE())) as memberid FROM tab_members WHERE substring(memberid, 1,2) = :membertype`;

  var bindVars = {
    membertype: membertype,
    //applicationid: applicationid
  };

  return getSqlQueryResult(dynamicSearch, bindVars, models)
    .then(function (result) {
      return result[0].memberid;
    }).catch(function (e) {
      throw e;
    });
}

export const saveRegistration = async (data) => {

  try {
    let vMemberTypeCode = data.typeofmembership.substr(0, 1) + 'M';

    if (!data.memberid || data.memberid === '') {
      let vMemberId = await getMemberId(vMemberTypeCode, models);
      data.memberid = vMemberId;
      vMemberTypeCode
    }
    else {
      //Check MemberId Format Validation
    }

    if (vMemberTypeCode === 'LM') {
      data.typeofmembership_bn = 'আজীবন সদস্য';
    }
    if (vMemberTypeCode === 'GM') {
      data.typeofmembership_bn = 'সাধারণ সদস্য';
    }
    if (vMemberTypeCode === 'HM') {
      data.typeofmembership_bn = 'সম্মাননাসূচক সদস্য';
    }

    data.dob = (data.dob === '' ? null : data.dob);
    data.dateofmarriage = (data.dateofmarriage === '' ? null : data.dateofmarriage);
    data.paymentamount = (data.paymentamount === '' ? 0 : data.paymentamount);
    data.paymentdate = (data.paymentdate === '' ? null : data.paymentdate);
    data.facebookurl = (data.facebookurl === 'facebook.com/' ? null : data.facebookurl);
    data.applyid = (data.applyid ? data.applyid : null);

    data.child1dob = null;
    data.child2dob = null;
    data.child3dob = null;
    data.child4dob = null;

    data.child1name = null;
    data.child1name = null;
    data.child1name = null;
    data.child1name = null;

    let childname = data['childname[]'];

    if (childname && (childname instanceof Array)) {
      if (childname.length > 0) {
        childname.forEach(function (chnm, i) {
          if (i === 0)
            data.child1name = chnm;
          else if (i === 1)
            data.child2name = chnm;
          else if (i === 2)
            data.child3name = chnm;
          else if (i === 3)
            data.child4name = chnm;
        });
      }
    }
    else {
      data.child1name = childname;
    }

    let childdob = data['childdob[]'];

    if (childdob && (childdob instanceof Array)) {
      if (childdob.length > 0) {
        childdob.forEach(function (chdob, i) {
          if (i === 0)
            data.child1dob = (chdob === '' ? null : chdob);
          else if (i === 1)
            data.child2dob = (chdob === '' ? null : chdob);
          else if (i === 2)
            data.child3dob = (chdob === '' ? null : chdob);
          else if (i === 3)
            data.child4dob = (chdob === '' ? null : chdob);
        });
      }
    }
    else {
      data.child1dob = (childdob === '' ? null : childdob);
    }

    return models.tabMembers.create({
      memberid: data.memberid,
      firstname: data.firstname,
      fullname_bn: data.fullname_bn,
      fathername: data.fathername,
      mothername: data.mothername,
      dob: data.dob,
      bloodgroup: data.bloodgroup,
      nid: data.nid,
      sscbatch: data.sscbatch,
      presentaddress: data.presentaddress,
      presentupozillathana: data.presentupozillathana,
      presentdistrict: data.presentdistrict,
      presentdivision: data.presentdivision,
      parmanentaddress: data.parmanentaddress,
      permanentvillage: data.permanentvillage,
      permanentupozillathana: data.permanentupozillathana,
      permanentdistrict: data.permanentdistrict,
      permanentdivision: data.permanentdivision,
      mobile: data.mobile,
      email: data.email,
      facebookurl: data.facebookurl,
      occupation: data.occupation,
      organization: data.organization,
      officeaddress: data.officeaddress,
      officephone: data.officephone,
      maritalsattus: data.maritalsattus,
      spousename: data.spousename,
      dateofmarriage: data.dateofmarriage,
      child1name: data.child1name,
      child1dob: data.child1dob,
      child2name: data.child2name,
      child2dob: data.child2dob,
      child3name: data.child3name,
      child3dob: data.child3dob,
      child4name: data.child4name,
      child4dob: data.child4dob,
      typeofmembership: data.typeofmembership,
      typeofmembership_bn: data.typeofmembership_bn,
      typeofpayment: data.typeofpayment,
      paymentid: data.paymentid,
      paymentamount: data.paymentamount,
      paymentdate: data.paymentdate,
      memberimageurl: data.memberimageurl,
      applyid: data.applyid
    }).then(async function (tabMember) {

      let newMember = tabMember.get({ plain: true });
      if (data.email !== '') {

        models.sysUsers.create({
          email: data.email,
          passwordstring: '',
          firstname: data.firstname,
          lastname: '',
          fullname_bn: data.fullname_bn,
          admin: 0,
          memberid: data.memberid,
          allowedip: null,
          forcepassword: 1,
          wrongpassattempt: 0,
          islocked: 0,
          autounlock: null,
          isactive: 1,
          passwordexpirydate: null,
          resetpasswordurl: null,
          updatedby: 1,
          createdby: 1
        }).then(async function (user) {
          //send email for activation link
          // try {
          //   let passrestToken = await getPasswordResetToken(data.email, data.memberid);
          //   let activateAccount = {};

          //   activateAccount.passwordtoken = passrestToken;
          //   activateAccount.redirecturl = "http://localhost:8989/resetpassword";

          //   await mail.sendAccountCreated(newMember, activateAccount);
          // }
          // catch (e) {
          //   throw e;
          // }

        }).catch((err) => {
          throw err;
        });
      }
      return newMember;
    })
      .catch((e) => {
        throw e;
      });
  }
  catch (err) {
    throw err;
  };


}

export const updateRegistration = async (data) => {

  let vMemberTypeCode = data.typeofmembership.substr(0, 1) + 'M';

  if (vMemberTypeCode === 'LM') {
    data.typeofmembership_bn = 'আজীবন সদস্য';
  }
  if (vMemberTypeCode === 'GM') {
    data.typeofmembership_bn = 'সাধারণ সদস্য';
  }
  if (vMemberTypeCode === 'HM') {
    data.typeofmembership_bn = 'সম্মাননাসূচক সদস্য';
  }

  data.dob = (data.dob === '' ? null : data.dob);
  data.dateofmarriage = (data.dateofmarriage === '' ? null : data.dateofmarriage);
  data.paymentamount = (data.paymentamount === '' ? 0 : data.paymentamount);
  data.paymentdate = (data.paymentdate === '' ? null : data.paymentdate);
  data.facebookurl = (data.facebookurl === 'facebook.com/' ? null : data.facebookurl);

  data.child1dob = (data.child1dob === '' ? null : data.child1dob);
  data.child2dob = (data.child2dob === '' ? null : data.child2dob);
  data.child3dob = (data.child3dob === '' ? null : data.child3dob);
  data.child4dob = (data.child4dob === '' ? null : data.child4dob);

  return models.tabMembers.update({
    firstname: data.firstname,
    fullname_bn: data.fullname_bn,
    fathername: data.fathername,
    mothername: data.mothername,
    dob: data.dob,
    bloodgroup: data.bloodgroup,
    nid: data.nid,
    sscbatch: data.sscbatch,
    presentaddress: data.presentaddress,
    presentupozillathana: data.presentupozillathana,
    presentdistrict: data.presentdistrict,
    presentdivision: data.presentdivision,
    parmanentaddress: data.parmanentaddress,
    permanentvillage: data.permanentvillage,
    permanentupozillathana: data.permanentupozillathana,
    permanentdistrict: data.permanentdistrict,
    permanentdivision: data.permanentdivision,
    mobile: data.mobile,
    email: data.email,
    facebookurl: data.facebookurl,
    occupation: data.occupation,
    organization: data.organization,
    officeaddress: data.officeaddress,
    officephone: data.officephone,
    maritalsattus: data.maritalsattus,
    spousename: data.spousename,
    dateofmarriage: data.dateofmarriage,
    child1name: data.child1name,
    child1dob: data.child1dob,
    child2name: data.child2name,
    child2dob: data.child2dob,
    child3name: data.child3name,
    child3dob: data.child3dob,
    child4name: data.child4name,
    child4dob: data.child4dob,
    typeofmembership: data.typeofmembership,
    typeofmembership_bn: data.typeofmembership_bn,
    typeofpayment: data.typeofpayment,
    paymentid: data.paymentid,
    paymentamount: data.paymentamount,
    paymentdate: data.paymentdate,
    memberimageurl: data.memberimageurl
  },
    {
      where: {
        memberid: data.memberid
      }
    }).then(function (tabMember) {

      if (data.email && data.email !== '') {
        models.sysUsers.update({
          email: data.email,
          firstname: data.firstname,
          lastname: '',
          updatedby: 1
        },
          {
            where: {
              memberid: data.memberid
            }
          }).then(function (user) {
            //send email for activation link
            //user.dataValues;
          }).catch((err) => {
            throw err;
          });
      }

      return tabMember[0];
    })
    .catch((e) => {
      throw e;
    });

}


export const getMember = async (pId) => {

  return models.tabMembers.findOne({
    where: {
      [models.Sequelize.Op.or]: [
        { id: pId },
        { memberid: pId }
      ]
    }
  })
    .then(function (Member) {
      return Member;
    }).catch(function (err) {
      console.log('Oops! something went wrong, : ', err);
    });
}



export const getMemberActiveList = async (pIsActive) => {
  return models.tabMembers.findAll({
    where: { membershipstatus: pIsActive },
    order: [
      ['id', 'DESC']
    ],
    attributes: ['id', 'memberid', 'typeofmembership', 'typeofmembership_bn', 'fullname_bn', 'firstname', 'fathername', 'mothername', 'dob', 'bloodgroup', 'nid', 'email', 'mobile', 'facebookurl', 'occupation', 'organization', 'paymentdate', 'memberimageurl']
  }).then(function (Members) {
    return Members;
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

export const getApprovalMemberList = async (Pstatus) => {
  return models.tabApplyMember.findAll({
    where: { membershipstatus: Pstatus },
    order: [
      ['id', 'DESC']
    ],
    attributes: ['id', 'typeofmembership', 'fullname_bn', 'firstname', 'fathername', 'mothername', 'dob', 'bloodgroup', 'nid', 'email', 'mobile', 'facebookurl', 'occupation', 'organization', 'paymentdate', 'memberimageurl']
  }).then(function (Members) {
    return Members;
  }).catch(function (err) {
    console.log('Oops! something went wrong, : ', err);
  });
}

export const getApproveMember = async (pId) => {
  return models.tabApplyMember.findOne({
    where: {
      [models.Sequelize.Op.or]: [
        { id: pId }
      ]
    }
  })
    .then(function (Member) {
      return Member;
    }).catch(function (err) {
      console.log('Oops! something went wrong, : ', err);
    });
}


export const saveApplyRegistration = async (data) => {

  data.dob = (data.dob === '' ? null : data.dob);
  data.dateofmarriage = (data.dateofmarriage === '' ? null : data.dateofmarriage);
  data.paymentamount = (data.paymentamount === '' ? 0 : data.paymentamount);
  data.paymentdate = (data.paymentdate === '' ? null : data.paymentdate);
  data.facebookurl = (data.facebookurl === 'facebook.com/' ? null : data.facebookurl);

  data.child1dob = null;
  data.child2dob = null;
  data.child3dob = null;
  data.child4dob = null;

  data.child1name = null;
  data.child2name = null;
  data.child3name = null;
  data.child4name = null;


  let childname = data['childname[]'];

  if (childname && (childname instanceof Array)) {
    if (childname.length > 0) {
      childname.forEach(function (chnm, i) {
        if (i === 0)
          data.child1name = chnm;
        else if (i === 1)
          data.child2name = chnm;
        else if (i === 2)
          data.child3name = chnm;
        else if (i === 3)
          data.child4name = chnm;
      });
    }
  }
  else {
    data.child1name = childname;
  }

  let childdob = data['childdob[]'];

  if (childdob && (childdob instanceof Array)) {
    if (childdob.length > 0) {
      childdob.forEach(function (chdob, i) {
        if (i === 0)
          data.child1dob = (chdob === '' ? null : chdob);
        else if (i === 1)
          data.child2dob = (chdob === '' ? null : chdob);
        else if (i === 2)
          data.child3dob = (chdob === '' ? null : chdob);
        else if (i === 3)
          data.child4dob = (chdob === '' ? null : chdob);
      });
    }
  }
  else {
    data.child1dob = (childdob === '' ? null : childdob);
  }

  return models.tabApplyMember.create({
    firstname: data.firstname,
    fullname_bn: data.fullname_bn,
    fathername: data.fathername,
    mothername: data.mothername,
    dob: data.dob,
    bloodgroup: data.bloodgroup,
    nid: data.nid,
    sscbatch: data.sscbatch,
    presentaddress: data.presentaddress,
    presentupozillathana: data.presentupozillathana,
    presentdistrict: data.presentdistrict,
    presentdivision: data.presentdivision,
    parmanentaddress: data.parmanentaddress,
    permanentvillage: data.permanentvillage,
    permanentupozillathana: data.permanentupozillathana,
    permanentdistrict: data.permanentdistrict,
    permanentdivision: data.permanentdivision,
    mobile: data.mobile,
    email: data.email,
    facebookurl: data.facebookurl,
    occupation: data.occupation,
    organization: data.organization,
    officeaddress: data.officeaddress,
    officephone: data.officephone,
    maritalsattus: data.maritalsattus,
    spousename: data.spousename,
    dateofmarriage: data.dateofmarriage,
    child1name: data.child1name,
    child1dob: data.child1dob,
    child2name: data.child2name,
    child2dob: data.child2dob,
    child3name: data.child3name,
    child3dob: data.child3dob,
    child4name: data.child4name,
    child4dob: data.child4dob,
    typeofmembership: data.typeofmembership,
    typeofpayment: data.typeofpayment,
    paymentid: data.paymentid,
    paymentamount: data.paymentamount,
    paymentdate: data.paymentdate,
    memberimageurl: data.memberimageurl
  }).then(async function (tabApplMember) {

    // if (data.email !== '') {

    //   try {

    //     let emailData = {};
    //     emailData.receiver = data.email;
    //     emailData.fullname = data.fullname_bn;
    //     emailData.redirecturl = "http://localhost:8989/resetpassword";
    //     //await mail.sendPasswordReset(emailData);
    //   }
    //   catch (e) {
    //     throw e;
    //   }
    // }

    return tabApplMember.get({ plain: true });
  })
    .catch((e) => {
      throw e;
    });

}

export const updateApplyMember = async (pId, pStatus) => {

  return models.tabApplyMember.update({
    membershipstatus: pStatus
  },
    {
      where: {
        id: pId
      }
    }).then(function (tabApplyMember) {
      return tabApplyMember[0];
    })
    .catch((e) => {
      throw e;
    });

}


function camelToUnderscore(key) {
  var result = key.replace(/([A-Z])/g, " $1");
  return result.split(' ').join('_').toLowerCase();
}


module.exports = functions;