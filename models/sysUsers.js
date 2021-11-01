
import bcrypt from 'bcryptjs';
const salt = bcrypt.genSaltSync(10);
const hashPass = bcrypt.hashSync("2020", salt);

module.exports = (sequelize, DataTypes) => {
    const sysUsers = sequelize.define('sys_users', {
        userid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false
        },
        passwordstring: DataTypes.STRING,
        fullname: DataTypes.STRING,  
        admin: {
          type: DataTypes.TINYINT(1),
          defaultValue: 0
        },
        activesession: DataTypes.UUID,
        sessionexpirydate: DataTypes.DATE,
        allowedip: DataTypes.STRING,
        loginip: DataTypes.STRING,
        forcepassword: DataTypes.INTEGER,
        wrongpassattempt: DataTypes.INTEGER,
        islocked: DataTypes.INTEGER,
        autounlock: DataTypes.DATE,
        isactive: DataTypes.INTEGER,
        passwordexpirydate: DataTypes.DATEONLY,
        resetpasswordurl: DataTypes.TEXT,
        profilpicurl: DataTypes.STRING(512),
        updatedby: DataTypes.INTEGER,        
        createdby: DataTypes.INTEGER
      },
      {
        indexes:[
         {
           unique: true,
           fields:['email']
         }
        ]
      },
      {
         // add the timestamp attributes (updatedAt, createdAt)
         imestamps: true,
         // disable the modification of table names; By default, sequelize will automatically
        freezeTableName: true,
        // don't delete database entries but set the newly added attribute deletedAt
        paranoid: true,
        // schema: 'bhs_system',
        tableName: 'sys_users'
      },
      {
        indexes:[
          {
            unique: false,
            fields:['memberid']
          }
         ]
      }
    );

    // sysUsers.sync().then(() => {
    //   sysUsers.create({
    //     email: "mushariar@gmail.com",
		//   passwordstring: hashPass,
		//   firstname: "Mushariar",
		//   lastname: "Ahmmed",        
		//   admin: true,
		//   allowedip: null,
		//   forcepassword: 0,
		//   wrongpassattempt: 0,
		//   islocked: 0,
		//   autounlock: new Date(Date.now() + (1000*60*60*24*3650)),
		//   isactive: 1,
		//   passwordexpirydate: new Date(Date.now() + (1000*60*60*24*90)),
		//   resetpasswordurl: null,
		//   updatedby: 1,        
		//   createdby: 1
    //   });
    // });
  
    sysUsers.associate = (models) => {
      models.sysUsers.hasMany(models.sysUserPasswordHistory);
      models.sysUsers.hasMany(models.sysLoginAttemptLog); 
    };
  
    return sysUsers;
  }