import moment from 'moment';
import extracted from './dseDataExtraction';
import dseDataSrvc from './dseDataServices';

import dbDataSrvc from './dbDataService';



// var host = 'localhost', port = 11212;
// var memcache = require('memcache'),
//     client   = new memcache.Client(host, port);

// client.port = host
// client.host = port;

// client.on('connect', function(){ console.log("we've connected"); });
// client.on('close',   function(){ console.log("connection has been closed"); });
// client.on('timeout', function(){ console.log("socket timed out"); });
// client.on('error',   function(){ console.log("there was an error"); });

// client.connect()

/* DSE scraping options */

/* fetching stock prices & save them in memcache*/
// var dsebd = require('dse-bd').getShareInfo(function(data, b){

//   console.log("callback called");
//   console.log(data);
//     for(var i in data){
//         var stock = data[i], code  = stock.index;
//         //client.set(code, JSON.stringify(stock), function(error, result){}, 1000);
//     }
// },options);

var scrapCurrentShareInfo = () => {
  console.log("getTodayShareInfo Started");
  var options = {
    instant: true,
    keepAlive: false,
    interval: 1000 * 60
  };

  extracted.getTodayShareInfo(async function (data) {

    console.log("callback called in getTodayShareInfo");

    var uploadSharePrice = await dseDataSrvc.upsertSharePrice(data.todayshare);
    console.log("uploadSharePrice:" + uploadSharePrice);

    if (data.updateStatus) {
      data.updateStatus.updtindex = "TODAYINFO";
      var uploadUpdatetime = await dseDataSrvc.upsertUpdateStatus(data.updateStatus);
      console.log("uploadUpdatetime:" + uploadUpdatetime);
    }

    console.log("getTodayShareInfo Finished");

  }, options);

}

var scrapDSEAllShareData = () => {
  var options = {
    instant: true,
    keepAlive: false,
    interval: 1000 * 60
  };

  extracted.getAllShareInfo(function (data) {

    console.log("callback called in getAllShareInfo");
    //let updateTime = data.updatetime.substring(data.updatetime.indexOf('&nbsp;') + 6, data.updatetime.indexOf('</stron>')).trim().replace('at', '');

    var uploadSector = dseDataSrvc.upsertSectors(data.sertorlist);
    var uploadSharePrice = dseDataSrvc.upsertSharePrice(data.allshare);
    var uploadCompanySector = dseDataSrvc.upsertCompanySector(data.companysectorinfo);

    Promise.all([uploadSector, uploadSharePrice, uploadCompanySector]).then(function (result) {
      console.log("uploadSector:" + result[0]);
      console.log("uploadSharePrice:" + result[1]);
      console.log("uploadCompanySector:" + result[2]);

      if (data.updateStatus) {
        data.updateStatus.updtindex = "ALLINFO";
        dseDataSrvc.upsertUpdateStatus(data.updateStatus).then((uploadUpdatetime) => {
          console.log("uploadUpdatetime:" + uploadUpdatetime);
        });
      }

    });

  }, options);
}

var scrapArchievedData = async (startDate, endDate) => {

  var options = {
    instant: true,
    keepAlive: false,
    interval: 1000 * 60
  };

  var parameters = {
    startDate: startDate,
    endDate: startDate
  };

  await extracted.getArchievedShareInfo(async function (data) {

    console.log(data);

    console.log("callback called in fetchOlderDataMigration for " + startDate);

    if (data.archieveddata.length > 0) {
      var uploadArchievedData = await dseDataSrvc.upsertArchievedData(data.archieveddata);

      if (uploadArchievedData) {
        if (data.updateStatus) {
          data.updateStatus.updtindex = "ARCHIEVE";
          data.updateStatus.updatetime = startDate;
          var uploadUpdatetime = await dseDataSrvc.upsertUpdateStatus(data.updateStatus);
          console.log("uploadUpdatetime:" + uploadUpdatetime);
        }
      }
      console.log("uploadArchievedData:" + uploadArchievedData);
    }
    else {
      console.log("No data found for " + startDate);
    }



    let nextDate = moment(startDate).add(1, 'days');
    if (nextDate.diff(endDate, 'days') <= 0) {
      await scrapArchievedData(nextDate.format('YYYY-MM-DD'), endDate);
    }
  }, options, parameters);

}

var scrapCompanyList = () => {
  var options = {
    instant: true,
    keepAlive: false,
    interval: 1000 * 60
  };

  extracted.getCompayList(async function (data) {

    console.log("callback called in getCompayList");
    if (data.companylist && data.companylist.length > 0) {
      await scrapCompanyInfo(0, data.companylist, async function (companylist) {
        let uploadCompany = await dseDataSrvc.upsertCompanies(companylist);
        console.log("uploadCompany1:" + uploadCompany);
      });
    }
    else {
      console.log("getCompayList returned 0 data");
    }

  }, options);
}
var scrapCompanyInfo = async (index, companyList, callback) => {

  if (index == companyList.length) {
    console.log("callback called in CompanyInfo for " + companyList.length + " companies.");
    callback(companyList);
  }
  else {
    var options = {
      instant: true,
      keepAlive: false,
      interval: 1000 * 60
    };

    var parameters = companyList[index];

    console.log("Fetching data for: " + parameters.companycode);

    await extracted.getCompayInfo(async function (data) {

      if (data.companyinfo) {
        companyList[index] = data.companyinfo;

        if (index < companyList.length) {
          await scrapCompanyInfo(++index, companyList, callback);
        }
      }
      else {
        console.log("getCompayInfo returned 0 data for: " + parameters.companycode);
      }


    }, options, parameters);
  }

}

var scrapBrokerList = () => {
  var options = {
    instant: true,
    keepAlive: false,
    interval: 1000 * 60
  };

  extracted.getBrokerList(async function (data) {

    console.log("callback called in getBrokerList");
    if (data.brokerlist && data.brokerlist.length > 0) {
      var uploadBroker = await dseDataSrvc.upsertBrokers(data.brokerlist);
      console.log("uploadBroker:" + uploadBroker);
    }
    else {
      console.log("getBrokerList returned 0 data");
    }

  }, options);
}
var runCompanyNBrockerProcess = async () => {
  await scrapCompanyList();     // updates All information of Companies including name
  await scrapBrokerList();    // updates only Broker house list

  let updateStatus = {};
  updateStatus.updtindex = "COMPANYINFO";
  updateStatus.bizdate = moment().format("YYYY-MM-DD");
  updateStatus.biztime = moment().format("hh:mm:ss");
  updateStatus.dseupdate = moment().format("YYYY-MM-DD hh:mm:ss");

  let uploadUpdatetime = await dseDataSrvc.upsertUpdateStatus(updateStatus);
  console.log("uploadUpdatetime:" + uploadUpdatetime);

}



const dseDataProcessing = async () => {
  var timeFormat = 'hh:mm:ss',
    tradeStartTime = moment('09:00:00', timeFormat);
    //tradeEndTime = moment('16:15:00', timeFormat);
  let dataObj = {};

  await dbDataSrvc.getUpdateStatus()
    .then((data) => {
      //console.log(data);
      data.forEach(async (t, i) => {

        switch (t.updtindex) {
          case "TODAYINFO":
            dataObj.Today = t;
            dataObj.Today.dayDiff = moment().startOf('day').diff(moment(t.bizdate, "YYYY-MM-DD"), 'days');

            break;
          case "ALLINFO":
            dataObj.AllInfo = t;
            dataObj.AllInfo.dayDiff = moment().startOf('day').diff(moment(t.bizdate), 'days');
            break;
          case "COMPANYINFO":
            dataObj.CompInfo = t;
            dataObj.CompInfo.dayDiff = moment().startOf('day').diff(moment(t.bizdate), 'days');
            break;
          case "ARCHIEVE":
            dataObj.Archieve = t;
            dataObj.Archieve.dayDiff = moment().startOf('day').diff(moment(t.bizdate), 'days');
            break;
          default:
            throw new Error('Undefined Transaction Type');
        };
      });
    });


    

  if (dataObj.Today.marketstatus === "Open" || (dataObj.Today.dayDiff > 0 && moment().isAfter(tradeStartTime))) {
    //Trade is running or Starting of the day after trade start time
    console.log("Trade is running or Starting of the day after trade start time");
    await scrapCurrentShareInfo();
  }
  else {
    //After the day end

    if (dataObj.AllInfo.dayDiff > 1) {
      await scrapDSEAllShareData(); // updates all share, sector list and sectorid with company, 
    }
    else {
      console.log("today's all share process already done");
    }

    //archieve day share data only, once a day
    var maxArcvDate = await dbDataSrvc.maxArchieveDate();
    let startDate = moment(maxArcvDate.maxdate);//.format("YYYY-MM-DD");
    let endDate = moment().startOf('day');
    //console.log(maxArcvDate.maxdate + "-----" + endDate.format("YYYY-MM-DD"));
    if (endDate.diff(moment(startDate), 'days') > 0) {
      //max data date is less then today and today data process has been execited
      if (dataObj.Today.dayDiff === 0) {
        console.log("today's archieve process");
        await scrapArchievedData(startDate.format('YYYY-MM-DD'), endDate);
      }

    }
    else {
      console.log("today's archieve process already done");
    }

    if (dataObj.CompInfo.dayDiff > 0) {
      console.log("EOD process for Company Information");
      //runCompanyNBrockerProcess();
    }
    else {
      console.log("today's Company Information process already done");
    }

  }



  /*
    if (moment().isBetween(tradeStartTime, tradeEndTime)) {
      //only current day process between set time
      console.log("Between trade time");
      await scrapCurrentShareInfo();
    }
    else if (dataObj.Today.marketstatus === "Open" && dataObj.Today.dayDiff === 0) {
      console.log("Extra time open");
      //only current day process if market is open beyond my set time
      await scrapCurrentShareInfo();
    }
    else {
      // all share of current day info, will run after trade time and market is already closed. Only once a day
      if (dataObj.AllInfo.dayDiff > 1) {
        await scrapDSEAllShareData(); // updates all share, sector list and sectorid with company, 
      }
      else {
        console.log("today's all share process already done");
      }
  
      //archieve day share data only, once a day
      var maxArcvDate = await dbDataSrvc.maxArchieveDate();
      let startDate = moment(maxArcvDate.maxdate);//.format("YYYY-MM-DD");
      let endDate = moment().startOf('day');
      if (endDate.diff(moment(startDate), 'days') > 0) {
        //max data date is less then today and today data process has been execited
        if (dataObj.Today.dayDiff === 0) {
          console.log("today's archieve process");
          await scrapArchievedData(startDate.format('YYYY-MM-DD'), endDate);
        }
  
      }
      else {
        console.log("today's archieve process already done");
      }
  
      if (dataObj.CompInfo.dayDiff > 0) {
        console.log("EOD process for Company Information");
        runCompanyNBrockerProcess();
      }
      else {
        console.log("today's Company Information process already done");
      }
  
    }
    */

  // Periodical task every 2 minutes
  setTimeout(dseDataProcessing, 2 * 60 * 1000);

}


module.exports = dseDataProcessing;