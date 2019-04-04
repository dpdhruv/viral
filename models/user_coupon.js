var Sequelize = require('sequelize');
var db = require('../config/db');
var uuid = require('uuid/v4');

// create a sequelize instance with our local postgres database information.
var sequelize = new Sequelize(db.url, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: true
  }
});
const table = 'user_coupon';

// setup User model and its fields.
var User_coupon = sequelize.define(table, {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
    },
    user_id:   {
        type: Sequelize.STRING,
        allowNull: false
    },
    coupon_id: {
        type: Sequelize.UUID,
        unique: true,
        allowNull: false
    },
    referrer_id:   {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
    }}, {
    hooks: {
    },
});

sequelize.sync()
    .then(() => console.log(`Table ${table} is created if one doesn't exist`))
    .catch(error => console.log('This error occured', error));

// export User model for use in other files.;
module.exports = User_coupon;