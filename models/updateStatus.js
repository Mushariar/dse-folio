module.exports = (sequelize, DataTypes) => {
  const updateStatus = sequelize.define('update_status', {
    updtindex: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    bizdate: DataTypes.STRING,
    biztime: DataTypes.STRING,
    dseupdate: DataTypes.STRING,
    marketstatus: DataTypes.STRING
  },
    {
      // add the timestamp attributes (updatedAt, createdAt)
      timestamps: true,
      // disable the modification of table names; By default, sequelize will automatically
      freezeTableName: true,
      // don't delete database entries but set the newly added attribute deletedAt
      paranoid: true,
      tableName: 'update_status'
    }
  );

  return updateStatus;
}