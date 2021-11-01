var jsdom = require('jsdom');
var http = require('https');
import moment from 'moment';

var ai = 0;
var alpha = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
    'X', 'Y', 'Z', 'Additional'
];

var area = [];

var globalSectorList = [];
var globalSharePrice = [];
var globalCompanySector = [];
var globalMarketStatus = {};


function getAllShareInfo(callback, options) {

    fetchIndustryListing(0).then((sectorList) => {
        globalSectorList = sectorList;
        fetchAllSharePrice(0, callback, options);
    });
}
function getTodayShareInfo(callback, options) {

    fetchTodaySharePrice(0).then((todaySharePrice) => {
        let result = {
            todayshare: todaySharePrice,
            updateStatus: globalMarketStatus
        }
        callback(result);
        return;
    });
}
function getBrokerList(callback, options) {

    fetchBrokerListing(0).then((brokerList) => {
        let result = {
            brokerlist: brokerList
        }
        callback(result);
        return;
    });
}
function getCompayList(callback, options) {

    fetchCompanyListing(0).then((companyList) => {

        let result = {
            companylist: companyList
        }
        callback(result);
        return;

    });
}

function getCompayInfo(callback, options, parameters) {

    fetchCompanyInfo(parameters, 0).then((CompanyInfo) => {

        let result = {
            companyinfo: CompanyInfo
        }
        callback(result);
        return;

    });
}

function getArchievedShareInfo(callback, options, parameters) {
    fetchOlderDataMigration(parameters, 0).then((archievedData) => {
        let result = {
            archieveddata: archievedData,
            updateStatus: globalMarketStatus
        }
        callback(result);
        return;
    });
}

var fetchIndustryListing = (retry) => {
    return new Promise((resolve, reject) => {
        try {
            var req = http.get('https://www.dsebd.org/by_industrylisting.php', function (res) {
                var data = '';

                const { statusCode } = res;
                //const contentType = res.headers['content-type'];
                let error;
                // Any 2xx status code signals a successful response but
                // here we're only checking for 200.
                if (statusCode !== 200) {
                    error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
                }

                if (error) {
                    console.error(error.message);
                    // Consume response data to free up memory
                    res.resume();

                    if (retry < 10) {
                        var vSectorList = fetchIndustryListing(++retry);
                        resolve(vSectorList);
                    }
                    else {
                        resolve();
                    }
                }

                res.setEncoding('utf8');

                res.on('data', (chunk) => {
                    data += chunk;
                });


                res.on('end', async function () {
                    var vSectorList = parseAllSectorData(data);
                    resolve(vSectorList);

                });

                res.on('error', function (err) {
                    console.log('error 1a', err);
                });

            });

            req.on('error', function (err) {
                console.log('error 1b', err);
                if (retry < 10) {
                    var vSectorList = fetchIndustryListing(++retry);
                    resolve(vSectorList);
                }
                else {
                    resolve();
                }
            });

        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}
var parseAllSectorData = (data) => {

    let SectorList = [];
    area = [];
    try {
        const { JSDOM } = jsdom;
        const dom = new JSDOM(data);
        const $ = (require('jquery'))(dom.window);

        var trs = $('.table-bordered tbody tr');

        trs.each(function (key, tr) {

            var tds = $(tr).find('td');


            if (tds.eq(1).find('a').attr('href')) {

                const urlParams = new URLSearchParams(decodeURI(tds.eq(1).find('a').attr('href')).split('?')[1]);
                const industryNo = urlParams.get('industryno');
                area.push(industryNo);
                var sector = {
                    sectorid: industryNo,
                    sectorname: tds.eq(1).text().trim()
                };

                if (sector.sectorid && sector.sectorid !== '') {
                    SectorList.push(sector);
                }
            }
        });
        return SectorList;
    } catch (err) {
        console.log(err);
    }

}

var fetchAllSharePrice = (index, callback, options) => {

    if (!index) index = 0;

    //if(index == 10){
    if (index == area.length) {



        let result = {
            sertorlist: globalSectorList,
            allshare: globalSharePrice,
            updateStatus: globalMarketStatus,
            companysectorinfo: globalCompanySector

        }
        callback(result);
        return;

        // if(options && options.keepAlive){
        // 	if(options.interval){
        // 		console.log('keeping alive with interval', options.interval );

        // 		setTimeout(function(){
        // 			fetchAllSharePrice(0, callback, options)
        // 		}, options.interval);

        // 	}else{
        // 		console.log('keeping alive instant');
        // 		fetchAllSharePrice(0, callback, options);
        // 	}
        // }
        // else{
        // 	return;
        // }

    }

    try {

        var sector = area[index];

        //var req    = http.get('https://www.dsebd.org/latest_share_price_alpha.php?letter=' + letter, function(res){
        var req = http.get('https://www.dsebd.org/ltp_industry.php?area=' + sector, function (res) {
            var data = '';

            const { statusCode } = res;
            //const contentType = res.headers['content-type'];
            let error;
            // Any 2xx status code signals a successful response but
            // here we're only checking for 200.
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            }

            if (error) {
                console.error(error.message);
                // Consume response data to free up memory
                res.resume();
            }

            res.setEncoding('utf8');

            res.on('data', (chunk) => {
                data += chunk;
            });


            res.on('end', function () {
                parseAllShareData(data, sector);
                fetchAllSharePrice(++index, callback, options);
            });

            res.on('error', function (err) {
                console.log('error', sector, err);
                fetchAllSharePrice(++index, callback, options);

            });

        });

        req.on('error', function (err) {
            console.log('error', sector, err);
            fetchAllSharePrice(++index, callback, options);
        });

    } catch (err) {
        console.log(err);
    }

}
var parseAllShareData = (data, area) => {
    const { JSDOM } = jsdom;
    const dom = new JSDOM(data);
    const $ = (require('jquery'))(dom.window);


    var marketStatus = $('header .HeaderTop .time');
    marketStatus.each(function (key, el) {
        if ($(el).text().trim().indexOf("Current Time:") > -1) {
            let p = $(el).text().trim();
            globalMarketStatus.biztime = p.substring(p.indexOf('Current Time:') + 13).replace('(BST)', '').trim();
        }
        else if ($(el).text().trim().indexOf("Market Status:") > -1) {
            let p = $(el).text().trim();
            globalMarketStatus.marketstatus = p.substring(p.indexOf('Market Status:') + 14).trim();
        }
        else{
            globalMarketStatus.bizdate = $(el).text().trim();
        }
    });
    
    var lastUpdate = $('.topBodyHead').text().trim();

    if (lastUpdate) {
        //Latest Share Price for Business Area: Bank on  Sep 10, 2020 at 1:50 PM
        globalMarketStatus.dseupdate = lastUpdate.substring(lastUpdate.indexOf(' on ') + 4).trim().replace(' at', '');
    }

    var trs = $('.table-bordered tbody tr');//.filter('[bgcolor="#FFFFFF"]');

    trs.each(function (key, tr) {

        var tds = $(tr).find('td');
        var share = {
            slno: key + 1,
            companycode: tds.eq(1).text().trim(),
            ltp: tds.eq(2).text().trim(),
            high: tds.eq(3).text().trim(),
            low: tds.eq(4).text().trim(),
            clsp: tds.eq(5).text().trim(),
            ycp: tds.eq(6).text().trim(),
            change: tds.eq(7).text().trim(),
            trade: tds.eq(8).text().trim(),
            valuemn: tds.eq(9).text().trim(),
            volume: tds.eq(10).text().trim()
        };

        if (share.companycode && share.companycode !== '') {
            globalSharePrice.push(share);
            let CompanyInfo = {
                companycode: share.companycode,
                sectorid: area
            }
            globalCompanySector.push(CompanyInfo);

        }

    });


}

var fetchCompanyInfo = (parameters, retry) => {

    return new Promise((resolve, reject) => {
        try {
            var req = http.get('https://www.dsebd.org/displayCompany.php?name=' + parameters.companycode, function (res) {
                var data = '';

                const { statusCode } = res;
                //const contentType = res.headers['content-type'];
                let error;
                // Any 2xx status code signals a successful response but
                // here we're only checking for 200.
                if (statusCode !== 200) {
                    error = new Error('Request Failed in CompanyInfo for ' + parameters.companycode + '\n' +
                        `Status Code: ${statusCode}`);
                }

                if (error) {
                    console.error(error.message);
                    // Consume response data to free up memory
                    res.resume();

                    if (retry < 10) {
                        var vCompanyInfo = fetchCompanyInfo(parameters, ++retry);
                        resolve(vCompanyInfo);
                    }
                    else {
                        resolve(parameters);
                    }

                }

                res.setEncoding('utf8');

                res.on('data', (chunk) => {
                    data += chunk;
                });


                res.on('end', async function () {
                    var vCompanyInfo = parseCompanyInfo(data, parameters);
                    resolve(vCompanyInfo);

                });

                res.on('error', function (err) {
                    console.log('error 1a', err);
                });

            });

            req.on('error', function (err) {
                console.log('error 1b', err);
                if (retry < 10) {
                    var vCompanyInfo = fetchCompanyInfo(parameters, ++retry);
                    resolve(vCompanyInfo);
                }
                else {
                    resolve(parameters);
                }
            });

        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}
var parseCompanyInfo = (data, parameters) => {


    try {
        const { JSDOM } = jsdom;
        const dom = new JSDOM(data);
        const $ = (require('jquery'))(dom.window);

        let CompanyInfo = {};
        CompanyInfo.companycode = parameters.companycode;
        CompanyInfo.comapnyname = parameters.comapnyname;

        var trs = $('.table-responsive table tbody tr');//.filter('[bgcolor="#FFFFFF"]');

        trs.each(function (key, tr) {



            var tds = $(tr).find('th, td');

            //console.log(tds.length);
            if (tds.eq(0).text().trim().indexOf("Listing Year") > -1) {
                CompanyInfo.listingyear = tds.eq(1).text().trim();
            }

            if (tds.eq(0).text().trim().indexOf("Market Category") > -1) {
                CompanyInfo.category = tds.eq(1).text().trim();
            }

            if (tds.eq(0).text().trim().indexOf("Electronic Share") > -1) {
                CompanyInfo.electronicshare = tds.eq(1).text().trim();
            }

            if (tds.eq(0).text().trim().indexOf("Cash Dividend") > -1) {
                CompanyInfo.cashdividend = tds.eq(1).text().trim();
            }

            if (tds.eq(0).text().trim().indexOf("Bonus Issue (Stock Dividend)") > -1) {
                CompanyInfo.bonusissue = tds.eq(1).text().trim();
            }
            if (tds.eq(0).text().trim().indexOf("Right Issue") > -1) {
                CompanyInfo.rightissue = tds.eq(1).text().trim();
            }
            if (tds.eq(0).text().trim().indexOf("Year End") > -1) {
                CompanyInfo.yearend = tds.eq(1).text().trim();
            }
            if (tds.eq(2).text().trim().indexOf("Sector") > -1) {
                CompanyInfo.sector = tds.eq(3).text().trim();
            }

            if (tds.eq(0).text().trim().indexOf("Market Category") > -1) {
                CompanyInfo.category = tds.eq(1).text().trim();
            }


        });

        return CompanyInfo;
    } catch (err) {
        console.log(err);
    }

}




var fetchCompanyListing = (retry) => {
    return new Promise((resolve, reject) => {
        try {
            var req = http.get('https://www.dsebd.org/company_listing.php', function (res) {
                var data = '';

                const { statusCode } = res;
                //const contentType = res.headers['content-type'];
                let error;
                // Any 2xx status code signals a successful response but
                // here we're only checking for 200.
                if (statusCode !== 200) {
                    error = new Error('Request Failed in CompanyListing.\n' +
                        `Status Code: ${statusCode}`);
                }

                if (error) {
                    console.error(error.message);
                    // Consume response data to free up memory
                    res.resume();
                    if(retry < 10){
                    var vCompanyList = fetchCompanyListing(++retry);
                    resolve(vCompanyList);
                    }
                    else{
                        resolve();
                    }
                }

                res.setEncoding('utf8');

                res.on('data', (chunk) => {
                    data += chunk;
                });


                res.on('end', async function () {
                    var vCompanyList = parseAllCompanyData(data);
                    resolve(vCompanyList);

                });

                res.on('error', function (err) {
                    console.log('error 1a', err);
                });

            });

            req.on('error', function (err) {
                console.log('error 1b', err);
                if(retry < 10){
                    var vCompanyList = fetchCompanyListing(++retry);
                    resolve(vCompanyList);
                    }
                    else{
                        resolve();
                    }
            });

        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}
var parseAllCompanyData = (data) => {

    let CompanyList = [];
    try {
        const { JSDOM } = jsdom;
        const dom = new JSDOM(data);
        const $ = (require('jquery'))(dom.window);

        alpha.forEach(function (item, index) {

            var codes = $('#' + item + ' .BodyContent a').filter('.ab1');
            var titles = $('#' + item + ' .BodyContent span');

            codes.each(async function (i, div) {

                let companyCode = $(div).html().trim();
                let fullName = $(titles[i]).html().trim();
                if (companyCode && companyCode !== '') {
                    var company = {
                        companycode: companyCode,
                        comapnyname: fullName.substring(fullName.indexOf('(') + 1, fullName.indexOf(')')).trim()
                    };
                    CompanyList.push(company);

                }
            });
        });

        return CompanyList;
    } catch (err) {
        console.log(err);
    }

}

var fetchBrokerListing = (retry) => {
    return new Promise((resolve, reject) => {
        try {
            var req = http.get('https://www.dsebd.org/search_all.php', function (res) {
                var data = '';

                const { statusCode } = res;
                //const contentType = res.headers['content-type'];
                let error;
                // Any 2xx status code signals a successful response but
                // here we're only checking for 200.
                if (statusCode !== 200) {
                    error = new Error('Request Failed in BrokerListing.\n' +
                        `Status Code: ${statusCode}`);
                }

                if (error) {
                    console.error(error.message);
                    // Consume response data to free up memory
                    res.resume();
                    if (retry < 10) {
                        var vBrokerList = fetchBrokerListing(++retry);
                        resolve(vBrokerList);
                    }
                    else {
                        resolve();
                    }
                }

                res.setEncoding('utf8');

                res.on('data', (chunk) => {
                    data += chunk;
                });


                res.on('end', async function () {
                    var vBrokerList = parseAllBrokerData(data);
                    resolve(vBrokerList);

                });

                res.on('error', function (err) {
                    console.log('error 1a', err);
                });

            });

            req.on('error', function (err) {
                console.log('error 1b', err);
                if (retry < 10) {
                    var vBrokerList = fetchBrokerListing(++retry);
                    resolve(vBrokerList);
                }
                else {
                    resolve();
                }
            });

        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}
var parseAllBrokerData = (data) => {

    let BrokerList = [];
    try {
        const { JSDOM } = jsdom;
        const dom = new JSDOM(data);
        const $ = (require('jquery'))(dom.window);

        var trs = $('table tbody tr');//.filter('[bgcolor="#FFFFFF"]');

        trs.each(function (key, tr) {

            var tds = $(tr).find('td');
            var broker = {
                brokercode: tds.eq(4).text().trim(),
                brokername: tds.eq(1).text().trim(),
                slno: tds.eq(0).text().trim(),
                holderno: tds.eq(3).text().trim(),
                isactive: 1
            };

            if (!isNaN(broker.slno) && broker.brokercode !== '' && broker.brokercode.toUpperCase().indexOf('NIL') == -1) {
                BrokerList.push(broker);
            }

        });

        return BrokerList;
    } catch (err) {
        console.log(err);
    }

}

var fetchTodaySharePrice = (retry) => {
    return new Promise((resolve, reject) => {
        try {

            var req = http.get('https://www.dsebd.org/latest_share_price_scroll_l.php', function (res) {
                var data = '';

                const { statusCode } = res;
                //const contentType = res.headers['content-type'];
                let error;
                // Any 2xx status code signals a successful response but
                // here we're only checking for 200.
                if (statusCode !== 200) {
                    error = new Error('Request Failed in TodaySharePrice.\n' +
                        `Status Code: ${statusCode}`);
                }

                if (error) {
                    console.error(error.message);
                    // Consume response data to free up memory
                    res.resume();
                    if (retry < 10) {
                        var vTodaySharePrice = fetchTodaySharePrice(++retry);
                        resolve(vTodaySharePrice);
                    }
                    else {
                        resolve();
                    }
                }

                res.setEncoding('utf8');

                res.on('data', (chunk) => {
                    data += chunk;
                });


                res.on('end', async function () {
                    var vTodaySharePrice = parseTodayShareData(data);
                    resolve(vTodaySharePrice);

                });

                res.on('error', function (err) {
                    console.log('error 1a', err);
                });

            });

            req.on('error', function (err) {
                console.log('error 1b', err);
                if (retry < 10) {
                    var vTodaySharePrice = fetchTodaySharePrice(++retry);
                    resolve(vTodaySharePrice);
                }
                else {
                    resolve();
                }
            });

        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}
var parseTodayShareData = (data) => {
    const { JSDOM } = jsdom;
    const dom = new JSDOM(data);
    const $ = (require('jquery'))(dom.window);

    let ShareList = [];

    var marketStatus = $('header .HeaderTop .time');
    marketStatus.each(function (key, el) {
        if ($(el).text().trim().indexOf("Current Time:") > -1) {
            //Current Time: 3:43:57 AM (BST)
            let p = $(el).text().trim();
            globalMarketStatus.biztime = p.substring(p.indexOf('Current Time:') + 13).replace('(BST)', '').trim();
        }
        else if ($(el).text().trim().indexOf("Market Status:") > -1) {
            //Market Status: Closed
            let p = $(el).text().trim();
            globalMarketStatus.marketstatus = p.substring(p.indexOf('Market Status:') + 14).trim();
        }
        else{
            //Saturday, September 19, 2020
            globalMarketStatus.bizdate = $(el).text().trim();
        }
    });
    
    var lastUpdate = $('.topBodyHead').text().trim();

    if (lastUpdate) {
        //Latest Share Price On Sep 09, 2020 at 4:00 PM
        globalMarketStatus.dseupdate = lastUpdate.substring(lastUpdate.indexOf('On ') + 3).trim().replace(' at', '');
    }


    var trs = $('.table-bordered tbody tr');//.filter('[bgcolor="#FFFFFF"]');

    trs.each(function (key, tr) {

        var tds = $(tr).find('td');
        var share = {
            slno: key + 1,
            companycode: tds.eq(1).text().trim(),
            ltp: tds.eq(2).text().trim(),
            high: tds.eq(3).text().trim(),
            low: tds.eq(4).text().trim(),
            clsp: tds.eq(5).text().trim(),
            ycp: tds.eq(6).text().trim(),
            change: tds.eq(7).text().trim(),
            trade: tds.eq(8).text().trim(),
            valuemn: tds.eq(9).text().trim(),
            volume: tds.eq(10).text().trim()
        };

        if (share.companycode && share.companycode !== '') {
            ShareList.push(share);
        }

    });

    return ShareList;
}


var fetchOlderDataMigration = (parameters, retry) => {
    return new Promise((resolve, reject) => {



        try {
            var req = http.get('https://www.dsebd.org/day_end_archive.php?startDate=' + parameters.startDate + '&endDate=' + parameters.endDate + '&inst=All%20Instrument&archive=data', function (res) {
                var data = '';

                const { statusCode } = res;
                //const contentType = res.headers['content-type'];
                let error;
                // Any 2xx status code signals a successful response but
                // here we're only checking for 200.
                if (statusCode !== 200) {
                    error = new Error('Request Failed in OlderDataMigration.\n' +
                        `Status Code: ${statusCode}, ` + ` startDate: ` + parameters.startDate + `, endDate: ` + parameters.endDate);
                }

                if (error) {
                    console.error(error.message);
                    // Consume response data to free up memory
                    res.resume();
                    if (retry < 10) {
                        var archievedData = fetchOlderDataMigration(parameters, ++retry);
                        resolve(archievedData);
                    }
                    else {
                        resolve();
                    }
                }

                res.setEncoding('utf8');

                res.on('data', (chunk) => {
                    data += chunk;
                });


                res.on('end', async function () {
                    var archievedData = parseOlderData(data);
                    resolve(archievedData);

                });

                res.on('error', function (err) {
                    console.log('error 1a', err);
                });

            });

            req.on('error', function (err) {
                console.log('error 1b', err);
                if (retry < 10) {
                    var archievedData = fetchOlderDataMigration(parameters, ++retry);
                    resolve(archievedData);
                }
                else {
                    resolve();
                }
            });

        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}
var parseOlderData = (data) => {

    let ShareList = [];
    try {
        const { JSDOM } = jsdom;
        const dom = new JSDOM(data);
        const $ = (require('jquery'))(dom.window);

        var marketStatus = $('header .HeaderTop .time');
        marketStatus.each(function (key, el) {
        if ($(el).text().trim().indexOf("Current Time:") > -1) {
            let p = $(el).text().trim();
            globalMarketStatus.biztime = p.substring(p.indexOf('Current Time:') + 13).replace('(BST)', '').trim();
        }
        else if ($(el).text().trim().indexOf("Market Status:") > -1) {
            let p = $(el).text().trim();
            globalMarketStatus.marketstatus = p.substring(p.indexOf('Market Status:') + 14).trim();
        }
        else{
            globalMarketStatus.bizdate = $(el).text().trim();
        }

        globalMarketStatus.dseupdate = null;
    });

        var trs = $('.table-bordered tbody tr');//.filter('[bgcolor="#FFFFFF"]');

        trs.each(function (key, tr) {
            //#	DATE	TRADING CODE	LTP*	HIGH	LOW	OPENP*	CLOSEP*	YCP	TRADE	VALUE (mn)	VOLUME

            var tds = $(tr).find('td');
            var share = {
                slno: key + 1,
                transdate: tds.eq(1).text().trim(),
                companycode: tds.eq(2).text().trim(),
                ltp: tds.eq(3).text().trim(),
                high: tds.eq(4).text().trim(),
                low: tds.eq(5).text().trim(),
                opnp: tds.eq(6).text().trim(),
                clsp: tds.eq(7).text().trim(),
                ycp: tds.eq(8).text().trim(),
                trade: tds.eq(9).text().trim(),
                valuemn: tds.eq(10).text().trim(),
                volume: tds.eq(11).text().trim()
            };

            if (share.companycode && share.companycode !== '') {
                ShareList.push(share);
            }

        });

        return ShareList;
    } catch (err) {
        console.log(err);
    }

}

var getDseData = {};
getDseData.getAllShareInfo = getAllShareInfo;
getDseData.getTodayShareInfo = getTodayShareInfo;
getDseData.getCompayList = getCompayList;
getDseData.getBrokerList = getBrokerList;
getDseData.getCompayInfo = getCompayInfo;

getDseData.getArchievedShareInfo = getArchievedShareInfo;


module.exports = getDseData;
