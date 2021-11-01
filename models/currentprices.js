module.exports = (sequelize, DataTypes) => {
  const currentprices = sequelize.define('currentprices', {
    slno: DataTypes.INTEGER,
    companycode: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    ltp: DataTypes.STRING,
    high: DataTypes.STRING,
    low: DataTypes.STRING,
    clsp: DataTypes.STRING,
    ycp: DataTypes.STRING,
    change: DataTypes.STRING,
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
      tableName: 'currentprices'
    }
  );

  currentprices.associate = models => {
    models.currentprices.belongsTo(models.companies, {foreignKey: 'companycode'});
  };
  return currentprices;
}