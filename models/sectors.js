module.exports = (sequelize, DataTypes) => {
  const sectors = sequelize.define('sectors', {
    sectorid: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    sectorname: DataTypes.STRING
  },
    {
      // add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,
      // disable the modification of table names; By default, sequelize will automatically
      freezeTableName: true,
      // don't delete database entries but set the newly added attribute deletedAt
      paranoid: true,
      tableName: 'sectors'
    }
  );

  return sectors;
}