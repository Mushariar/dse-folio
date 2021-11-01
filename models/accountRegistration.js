
module.exports = (sequelize, DataTypes) => {
    const accountRegistration = sequelize.define('account_registration', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        userid: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          fullname: {
            type: DataTypes.STRING,
            allowNull: false
          },
          dob: {
            type: DataTypes.DATEONLY,
            defaultValue: null
          },
          nid: DataTypes.STRING,
          mobile: DataTypes.STRING,
          bankname: DataTypes.STRING,
          bankaccount: DataTypes.STRING,
          brokercode: DataTypes.STRING,
          boaccountno: DataTypes.STRING,
          boid: {
            type: DataTypes.STRING,
            allowNull: false
          },
          isdefault: {
            type: DataTypes.TINYINT,
            defaultValue: 1
          },
          commissionpct: {
            type: DataTypes.FLOAT(17,2),
            defaultValue: 0.00
          },
          balance: {
            type: DataTypes.FLOAT(17,2),
            defaultValue: 0.00
          },
          occupation: DataTypes.STRING
      },
      {
        indexes:[
         {
           unique: false,
           fields:['userid']
         },
         {
            unique: true,
            fields:['boid']
          }
        ]
      },
      {
         // add the timestamp attributes (updatedAt, createdAt)
         imestamps: true,
         // disable the modification of table names; By default, sequelize will automatically
        freezeTableName: true,
        // don't delete database entries but set the newly added attribute deletedAt
        paranoid: true,
        tableName: 'account_registration'
      }
    );
  
    accountRegistration.associate = models => {
      models.accountRegistration.hasMany(models.transactionHistory, {foreignKey: 'accountid'});
      models.accountRegistration.hasMany(models.tradeSummary, {foreignKey: 'accountid'});
      models.accountRegistration.belongsTo(models.brokerHouses, {foreignKey: 'brokercode'});
    };

    return accountRegistration;
  }
  