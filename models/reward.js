var Sequelize = require('sequelize');
var db = require('../config/db');
var uuid = require('uuid/v4');

var sequelize = new Sequelize(db.url, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: true
  }
});

var table = 'rewards';
// setup User model and its fields.
var Reward = sequelize.define(table, {
    campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    reward_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    threshold: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    coupon_code:{
        type: Sequelize.STRING,
        allowNull: false
    },
    coupon_value:   {
        type: Sequelize.STRING,
        allowNull: false
    },
    coupon_message: {
        type: Sequelize.STRING,
        allowNull: false
    },
    image_url:  {
        type: Sequelize.STRING
    }}, {
    hooks: {
    },
});

sequelize.sync()
    .then(() => console.log(`Table ${table} is created if one doesn't exist`))
    .catch(error => console.log('This error occured', error));

module.exports = Reward;

