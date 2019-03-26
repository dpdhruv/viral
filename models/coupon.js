var Sequelize = require('sequelize');
var db = require('../config/db');
var uuid = require('uuid/v4');

var sequelize = new Sequelize(db.url, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: true
  }
});

var table = 'coupon';
// setup User model and its fields.
var Coupon = sequelize.define(table, {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
    },
    code: {
        type: Sequelize.STRING,
        allowNull: false
    },
    coupon_value: {
        type: Sequelize.STRING,
        allowNull: false
    },
    coupon_message: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM,
        values: ['active', 'expired'],
        defaultValue: 'active',
        allowNull: false
    }}, {
    hooks: {
    },
});

sequelize.sync()
    .then(() => console.log(`Table ${table} is created if one doesn't exist`))
    .catch(error => console.log('This error occured', error));

module.exports = Coupon;

