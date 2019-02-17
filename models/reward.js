var Sequelize = require('sequelize');
var db = require('../config/db');
var uuid = require('uuid/v4');

var sequelize = new Sequelize(db.url);

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
    coupon:{
        type: Sequelize.UUID,
        allowNull: false
    }}, {
    hooks: {
    },
});

sequelize.sync()
    .then(() => console.log(`Table ${table} is created if one doesn't exist`))
    .catch(error => console.log('This error occured', error));

module.exports = Reward;

