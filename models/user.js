var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');
var db = require('../config/db');
var crypto = require('crypto');
var voucher_codes = require('voucher-code-generator');

var sequelize = new Sequelize(db.url);
var key = process.env.KEY || 'secret';
var table = 'users';

let referrel_code = [];
function getReferralCode()  {
    let code = referrel_code.pop();
    if(!code)   {
        referrel_code = voucher_codes.generate({
            length: 7,
            count: 1000,
        })
        return referrel_code.pop();
    }
    return code;
}
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
        allowNull: false,
        defaultValue: getReferralCode()
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
        user.referral_token = getReferralCode();
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