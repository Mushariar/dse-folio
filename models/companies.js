module.exports = (sequelize, DataTypes) => {
  const companies = sequelize.define('companies', {
    companycode: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    comapnyname: DataTypes.STRING,
    sectorid: DataTypes.STRING,
    category: DataTypes.STRING,
    sector: DataTypes.STRING,
    cashdividend: DataTypes.STRING(512),
    bonusissue: DataTypes.STRING(512),
    rightissue: DataTypes.STRING(512),
    yearend: DataTypes.STRING,
    listingyear: DataTypes.STRING,
    electronicshare: DataTypes.STRING
  },
    {
      // add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,
      // disable the modification of table names; By default, sequelize will automatically
      freezeTableName: true,
      // don't delete database entries but set the newly added attribute deletedAt
      paranoid: true,
      tableName: 'companies'
    }
  );

  companies.associate = models => {
    models.companies.hasOne(models.currentprices, {foreignKey: 'companycode'});
    models.companies.hasMany(models.archievedPrices, {foreignKey: 'companycode'});
    models.companies.hasMany(models.transactionHistory, {foreignKey: 'companycode'});
    models.companies.hasMany(models.tradeSummary, {foreignKey: 'companycode'});
  };
  return companies;
}