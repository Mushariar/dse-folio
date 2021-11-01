module.exports = (sequelize, DataTypes) => {
  const archievedPrices = sequelize.define('archieved_prices', {
    slno: DataTypes.INTEGER,
    transdate: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    companycode: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    ltp: DataTypes.STRING,
    high: DataTypes.STRING,
    low: DataTypes.STRING,
    opnp: DataTypes.STRING,
    clsp: DataTypes.STRING,
    ycp: DataTypes.STRING,
    trade: DataTypes.STRING,
    valuemn: DataTypes.STRING,
    volume: DataTypes.STRING
  },
    {
      // add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,
      // disable the modification of table names; By default, sequelize will automatically
      freezeTableName: true,
      // don't delete database entries but set the newly added attribute deletedAt
      paranoid: true,
      tableName: 'archieved_prices'
    }
  );

  archievedPrices.associate = models => {
    models.archievedPrices.belongsTo(models.companies);
  };

  return archievedPrices;
}