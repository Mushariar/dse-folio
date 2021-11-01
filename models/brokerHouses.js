module.exports = (sequelize, DataTypes) => {
  const brokerHouses = sequelize.define('broker_houses', {
    brokercode: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    brokername: DataTypes.STRING,
    slno: DataTypes.INTEGER,
    holderno: DataTypes.INTEGER,
    isactive: DataTypes.INTEGER
  },
    {
      // add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,
      // disable the modification of table names; By default, sequelize will automatically
      freezeTableName: true,
      // don't delete database entries but set the newly added attribute deletedAt
      paranoid: true,
      tableName: 'broker_houses'
    }
  );


  brokerHouses.associate = models => {
    models.brokerHouses.hasMany(models.accountRegistration, {foreignKey: 'brokercode'});
  };

  return brokerHouses;
}