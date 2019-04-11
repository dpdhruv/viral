var Sequelize = require('sequelize');
var db = require('../config/db');

var sequelize = new Sequelize(db.url, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: false
    }
  });
  
  var table = 'admin_coupons';

  var Settings = sequelize.define(table, {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
    },
    coupon_id:  {
        type: Sequelize.UUID,
        allowNull: false
    }
    }, {
    hooks: {
    },
  });
  
  sequelize.sync()
    .then(() => console.log(`Table ${table} is created if one doesn't exist`))
    .catch(error => console.log('This error occured', error));
  
  // export User model for use in other files.;
  module.exports = Admin_coupon;
  
  