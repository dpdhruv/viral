var Sequelize = require('sequelize');
var db = require('../config/db');
var uuid = require('uuid/v4');

// create a sequelize instance with our local postgres database information.
var sequelize = new Sequelize(db.url, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: false
  }
});
const table = 'offer';

// setup User model and its fields.
var Offer = sequelize.define(table, {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
    },
    discount:   {
        type: Sequelize.REAL,
        allowNull: false
    },
    description:   {
        type: Sequelize.STRING,
        allowNull: true
    }}, {
    hooks: {
    },
});

sequelize.sync()
    .then(() => console.log(`Table ${table} is created if one doesn't exist`))
    .catch(error => console.log('This error occured', error));



// export User model for use in other files.;
module.exports = Offer;