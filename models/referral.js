var Sequelize = require('sequelize');
var db = require('../config/db');
var uuid = require('uuid/v4');

var sequelize = new Sequelize(db.url, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: true
  }
});

var table = 'referral';
// setup User model and its fields.
var Referral = sequelize.define(table, {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
    },
    user_id:   {
        type: Sequelize.STRING,
        allowNull: false
    },
    referral_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    referred_to: {
        type: Sequelize.STRING,
        allowNull: false
    },
    referral_status: {
        type: Sequelize.ENUM,
        values: ['expired', 'active'],
        defaultValue: 'active',
        allowNull: false,
    }}, {
    hooks: {
    },
});

sequelize.sync()
    .then(() => console.log(`Table ${table} is created if one doesn't exist`))
    .catch(error => console.log('This error occured', error));

// export User model for use in other files.;
module.exports = Referral;

