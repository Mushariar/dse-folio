
module.exports = (sequelize, DataTypes) => {
    const transactionHistory = sequelize.define('transaction_history', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        accountid: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          transdate: {
            type: DataTypes.DATEONLY,
            allowNull: false
          },
          transtype:  {
            type: DataTypes.STRING,
            allowNull: false
          },
          companycode: {
            type: DataTypes.STRING,
            allowNull: true
          },
          dividendpct: {
            type: DataTypes.FLOAT(17,2),
            defaultValue: 0.00
          },
          plusquantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
          },
          minusquantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
          },
          rate: {
            type: DataTypes.FLOAT(17,2),
            defaultValue: 0.00
          },
          totalprice: {
            type: DataTypes.FLOAT(17,2),
            defaultValue: 0.00
          },
          commission: {
            type: DataTypes.FLOAT(17,2),
            defaultValue: 0.00
          },
          debitamount: {
            type: DataTypes.FLOAT(17,2),
            defaultValue: 0.00
          },
          creditamount: {
            type: DataTypes.FLOAT(17,2),
            defaultValue: 0.00
          },
          availablebalance: {
            type: DataTypes.FLOAT(17,2),
            defaultValue: 0.00
          },
          avgcost: {
            type: DataTypes.FLOAT(17,2),
            defaultValue: 0.00
          },
          totalcost: {
            type: DataTypes.FLOAT(17,2),
            defaultValue: 0.00
          },
          realizedprofit: {
            type: DataTypes.FLOAT(17,2),
            defaultValue: 0.00
          },
          comments: DataTypes.STRING
      },
      {
         // add the timestamp attributes (updatedAt, createdAt)
         imestamps: true,
         // disable the modification of table names; By default, sequelize will automatically
        freezeTableName: true,
        // don't delete database entries but set the newly added attribute deletedAt
        paranoid: true,
        tableName: 'transaction_history'
      }
    );

    transactionHistory.associate = models => {
      models.transactionHistory.belongsTo(models.accountRegistration, {foreignKey: 'accountid'});
      models.transactionHistory.belongsTo(models.companies, {foreignKey: 'companycode'});
      models.transactionHistory.belongsTo(models.transType, {foreignKey: 'transtype'});
    };

    return transactionHistory;
  }
  