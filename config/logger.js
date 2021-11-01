const winston = require('winston');
const { combine, timestamp, label, prettyPrint } = winston.format;
require('winston-daily-rotate-file');

const accessLogTransport = new (winston.transports.DailyRotateFile)({
	filename: 'log/access/access-%DATE%.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	//maxSize: 1000,
	maxFiles: '7d',
	format: winston.format.json()
});


const accesslogger = winston.createLogger({
	format: combine(
		timestamp({format: 'YYYY-MM-DD HH:mm:ss'})
	  ),
	transports: [
		accessLogTransport
	]
  });

const errorLogTransport = new (winston.transports.DailyRotateFile)({
	filename: 'log/error/error-%DATE%.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	//maxSize: '20m',
	maxFiles: '7d',
	format: winston.format.json()
});

const errLogger = winston.createLogger({
	format: combine(
		timestamp({format: 'YYYY-MM-DD HH:mm:ss'})
	  ),
	transports: [
		errorLogTransport
	]
});

const appLogTransport = new (winston.transports.DailyRotateFile)({
	filename: 'log/application/application-%DATE%.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	//maxSize: '20m',
	maxFiles: '7d',
	format: winston.format.json()
});

const applogger = winston.createLogger({
	format: combine(
		timestamp({format: 'YYYY-MM-DD HH:mm:ss'})
	  ),
	transports: [
		appLogTransport
	]
});

const resultLogTransport = new (winston.transports.DailyRotateFile)({
	filename: 'log/result/result-%DATE%.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	//maxSize: '20m',
	maxFiles: '7d',
	format: winston.format.json(),
	timestamp: timestamp({format: 'YYYY-MM-DD HH:mm:ss'})
});

const resLogger = winston.createLogger({
	transports: [
		resultLogTransport
	]
});


const logger = function(logText){
	accesslogger.info(logText);
}
const errorLogger = function(logText){
	errLogger.error(logText)
}

const applicationLogger = function(logText){
    applogger.info(logText)
}

const resultLogger = (msg) => {
	resLogger.info(msg);
};

const cl = (msg) => {
	console.log(msg);
};

module.exports = {logger, errorLogger, applicationLogger, resultLogger, cl};