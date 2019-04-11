var Sequelize = require('sequelize');
var db = require('../config/db');

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
    name: {
        type: Sequelize.STRING,
    },
    value: {
        type: Sequelize.STRING,
    },
    message: {
        type: Sequelize.STRING,
    },
    logo: {
        type: Sequelize.STRING
    },
    background_image:   {
        type: Sequelize.STRING
    },
    theme_id:   {
        type: Sequelize.UUID
    },
    primary_colour: {
        type: Sequelize.STRING
    },
    secondary_colour:   {
        type: Sequelize.STRING
    },
    available_on:   {
        type: Sequelize.ARRAY(Sequelize.BOOLEAN)
    },
    available_to:   {
        type: Sequelize.ARRAY(Sequelize.BOOLEAN) 
    },
    available_at:   {
        type: Sequelize.INTEGER
    },
    campaign_id:    {
        type: Sequelize.INTEGER
    },
    send_media: {
        type: Sequelize.ARRAY(Sequelize.BOOLEAN)
    },
    email_message:  {
        type: Sequelize.STRING
    },
    mobile_message: {
        type: Sequelize.STRING
    }
    }, {
    hooks: {
    },
});

sequelize.sync()
    .then(() => console.log(`Table ${table} is created if one doesn't exist`))
    .catch(error => console.log('This error occured', error));

module.exports = Coupon;

