module.exports = (sequelize, DataTypes) => {
    const sysLoginAttemptLog = sequelize.define('sys_login_attempt_log', {
        loginattemptid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        sessionid: DataTypes.STRING,                
        userid: DataTypes.INTEGER,
        ipaddress: DataTypes.STRING,
        browsertype: DataTypes.STRING,        
        success: DataTypes.INTEGER,   
        errormessage: DataTypes.STRING,
        resv1: DataTypes.STRING,
        resv2: DataTypes.STRING,
        resv3: DataTypes.STRING,
        logintime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
      },
      {
         // add the timestamp attributes (updatedAt, createdAt)
         timestamps: false,
         // disable the modification of table names; By default, sequelize will automatically
        freezeTableName: true,
        // don't delete database entries but set the newly added attribute deletedAt
        paranoid: true,
        tableName: 'sys_login_attempt_log'
      }
    );
  
    sysLoginAttemptLog.associate = (models) => {
      models.sysLoginAttemptLog.belongsTo(models.sysUsers, {foreignKey: 'userid'});      
    };
  
    return sysLoginAttemptLog;
  }