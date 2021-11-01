module.exports = (sequelize, DataTypes) => {
  const transType = sequelize.define('trans_type', {
    transtype: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    drcr: DataTypes.STRING,
    transtypedesc: DataTypes.STRING,
    isactive: DataTypes.INTEGER
  },
    {
      // add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,
      // disable the modification of table names; By default, sequelize will automatically
      freezeTableName: true,
      // don't delete database entries but set the newly added attribute deletedAt
      paranoid: true,
      tableName: 'trans_type'
    }
  );

  transType.associate = models => {
    models.transType.hasMany(models.transactionHistory, {foreignKey: 'transtype'});
  };

  return transType;
}