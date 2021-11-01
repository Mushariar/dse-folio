import Sequelize from 'sequelize';
require('dotenv').config();

// let dbconfig = {
// 	DBNAME : '',
// 	USERNAME : '',
// 	PASSWORD : '',
// 	DBADDR : 'localhost',
// 	DBPORT : 3306
// };

let dbconfig = {
	DBNAME : process.env['DBNAME'],
	USERNAME : process.env['USERNAME'],
	PASSWORD : process.env['PASSWORD'],
	DBADDR : process.env['DBADDR'],
	DBPORT : process.env['DBPORT']
};


const sequelize = new Sequelize(
	dbconfig.DBNAME,
	dbconfig.USERNAME,
	dbconfig.PASSWORD,
	{
		host: dbconfig.DBADDR,
		port: dbconfig.DBPORT,
		dialect: 'mysql',
		//timezone: '+06:00',
		logging: false,
		pool: {
			max: 5,
			min: 0,
			idle: 5000,
			acquire: 5000
		}
	});

const models = {
	sysUsers: sequelize.import('./sysUsers'),
	sysLoginAttemptLog: sequelize.import('./sysLoginAttemptLog'),
	sysUserPasswordHistory: sequelize.import('./sysUserPasswordHistory'),
	sectors: sequelize.import('./sectors'),
	companies: sequelize.import('./companies'),
	currentprices:  sequelize.import('./currentprices'),
	updateStatus: sequelize.import('./updateStatus'),
	accountRegistration: sequelize.import('./accountRegistration'),
	brokerHouses: sequelize.import('./brokerHouses'),
	transactionHistory: sequelize.import('./transactionHistory'),
	tradeSummary: sequelize.import('./tradeSummary'),
	transType: sequelize.import('./transType'),
	archievedPrices: sequelize.import('./archievedPrices')
};


Object.keys(models).forEach((modelName) => {
	
	if ('associate' in models[modelName]) {
		models[modelName].associate(models);
	}
});


models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;