var Sequelize = require('sequelize');
require('sequelize-values')(Sequelize);
import models from "../models";
import moment from 'moment';

var functions = {};

functions.upsertSectors = async (data) => {

  return models.sectors.bulkCreate(data, {
    updateOnDuplicate: ['sectorname']
  }).then(function (response) {
    return true;// response;
  })
    .catch(function (err) {
      console.log('Oops! something went wrong, : ', err);
    });

}

functions.upsertCompanies = async (data) => {

  return models.companies.bulkCreate(data, {
    updateOnDuplicate: ['comapnyname', 'category', 'sector', 'cashdividend', 'bonusissue', 'rightissue', 'yearend', 'listingyear', 'electronicshare']
  }).then(function (response) {
    return true;// response;
  })
    .catch(function (err) {
      console.log('Oops! something went wrong, : ', err);
    });
}
functions.upsertCompanySector = async (data) => {

  return models.companies.bulkCreate(data, {
    updateOnDuplicate: ['sectorid']
  }).then(function (response) {
    return true;// response;
  })
    .catch(function (err) {
      console.log('Oops! something went wrong, : ', err);
    });
}

functions.upsertSharePrice = async (data) => {

  return models.currentprices.bulkCreate(data, {
    updateOnDuplicate: ['slno','ltp', 'high', 'low', 'clsp', 'ycp', 'change', 'trade', 'valuemn', 'volume' ]
  }).then(function (response) {
    return true;// response;
  })
    .catch(function (err) {
      console.log('Oops! something went wrong, : ', err);
    });

}

functions.upsertBrokers = async (data) => {

  return models.brokerHouses.bulkCreate(data, {
    updateOnDuplicate: ['brokername', 'slno', 'holderno', 'isactive' ]
  }).then(function (response) {
    return true;// response;
  })
    .catch(function (err) {
      console.log('Oops! something went wrong, : ', err);
    });

}

functions.upsertArchievedData = async (data) => {

  return models.archievedPrices.bulkCreate(data, {
    updateOnDuplicate: ['slno', 'ltp', 'high', 'low', 'opnp', 'clsp', 'ycp', 'trade', 'valuemn', 'volume']
  }).then(function (response) {
    return true;// response;
  })
    .catch(function (err) {
      console.log('Oops! something went wrong, : ', err);
    });
}

functions.upsertUpdateStatus = async (data) => {
  //Sep 09, 2020 at 4:00 PM
  data.dseupdate = data.dseupdate ? moment(data.dseupdate, "MMM DD, YYYY H:mm A").format("YYYY-MM-DD HH:mm:ss") : null;
  
  //Saturday, September 19, 2020
  data.bizdate = data.bizdate ? moment(data.bizdate, "dddd, MMMM DD, YYYY").format("YYYY-MM-DD") : null;


  return models.updateStatus.upsert(data).then(function (response) {
    return true;// response;
  })
    .catch(function (err) {
      console.log('Oops! something went wrong, : ', err);
    });

  }

  module.exports = functions;