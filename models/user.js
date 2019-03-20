var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');
var db = require('../config/db');
var randomize = require('randomatic');

var sequelize = new Sequelize(db.url, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: true
  }
});
var table = 'users';

// setup User model and its fields.
var User = sequelize.define(table, {
    username: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true,
        allowNull: false
    },
    name:   {
        type: Sequelize.STRING,
        allowNull: false
    },
    phone_no: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    referral_token: {
        type: Sequelize.STRING,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },  
    }, {
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
        user.referral_token = user.name.split(' ')[0] + '_' + randomize('Aa', 4) + randomize('0', 3);
      },
      beforeUpdate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
      }
    },
});

User.prototype.validPassword = function(password)   {
    return bcrypt.compareSync(password, this.password);
}

sequelize.sync()
    .then(() => {
        console.log(`Table ${table} is created if one doesn't exist`)
    })
    .catch(error => console.log('This error occured', error));
// export User model for use in other files.;
module.exports = User;