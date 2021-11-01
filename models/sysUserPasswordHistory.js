module.exports = (sequelize, DataTypes) => {
    const sysUserPasswordHistory = sequelize.define('sys_user_password_history', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        userid: DataTypes.INTEGER,
        passwordstring: DataTypes.STRING,
        passwordquestion: DataTypes.STRING,
        passwordanswer: DataTypes.STRING,
        resv1: DataTypes.STRING,
        resv2: DataTypes.STRING,
        resv3: DataTypes.STRING,                
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      },
      {
         // add the timestamp attributes (updatedAt, createdAt)
         timestamps: false,
         // disable the modification of table names; By default, sequelize will automatically
        freezeTableName: true,
        // don't delete database entries but set the newly added attribute deletedAt
        paranoid: true,
        tableName: 'sys_user_password_history',
      }
    );
  
    sysUserPasswordHistory.associate = models => {
      models.sysUserPasswordHistory.belongsTo(models.sysUsers, {foreignKey: 'userid'});
    };
  
    return sysUserPasswordHistory;
  }

