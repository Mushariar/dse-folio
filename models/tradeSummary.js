
module.exports = (sequelize, DataTypes) => {
  const tradeSummary = sequelize.define('trade_summary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    accountid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    companycode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    stockquantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalcost: {
      type: DataTypes.FLOAT(17, 2),
      defaultValue: 0.00
    },
    avgcost: {
      type: DataTypes.FLOAT(17, 2)
    },
    salequantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    saleamount: {
      type: DataTypes.FLOAT(17, 2),
      defaultValue: 0
    },
    totalcommission: {
      type: DataTypes.FLOAT(17, 2),
      defaultValue: 0
    },
    realizedprofit: {
      type: DataTypes.FLOAT(17, 2),
      defaultValue: 0.00
    },
    stockdivident: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    cashdivident: {
      type: DataTypes.FLOAT(17, 2),
      defaultValue: 0
    },
    targetrate: {
      type: DataTypes.FLOAT(17, 2),
      defaultValue: 0.00
    }
  },
    {
      indexes: [
        {
          unique: false,
          fields: ['accountid']
        },
        {
          unique: false,
          fields: ['companycode']
        }
      ]
    },
    {
      // create this column  manually
      //ALTER TABLE `trade_summaries` ADD `avgcost` FLOAT(17,2) GENERATED ALWAYS AS (if(`stockquantity`> 0,`totalcost`/`stockquantity`,0)) STORED AFTER `totalcost`;
      // add the timestamp attributes (updatedAt, createdAt)
      imestamps: true,
      // disable the modification of table names; By default, sequelize will automatically
      freezeTableName: true,
      // don't delete database entries but set the newly added attribute deletedAt
      paranoid: true,
      tableName: 'trade_summary'
    }
  );

  tradeSummary.associate = models => {
    models.tradeSummary.belongsTo(models.accountRegistration, { foreignKey: 'accountid' });
    models.tradeSummary.belongsTo(models.companies, { foreignKey: 'companycode' });
  };

  return tradeSummary;
}
