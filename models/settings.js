var Sequelize = require('sequelize');
var db = require('../config/db');

var sequelize = new Sequelize(db.url, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: true
    }
  });


var table = 'settings';

var Settings = sequelize.define(table, {
  id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
  },
  business: {
    type: Sequelize.STRING
  },
  website: {
    type: Sequelize.STRING
  },
  name: {
    type: Sequelize.STRING
  },
  tag:  {
    type: Sequelize.STRING
  },
  email:  {
    type: Sequelize.STRING
  },
  phone_no: {
    type: Sequelize.STRING
  },
  image:  {
    type: Sequelize.STRING
  },
  primary_colour:{
    type: Sequelize.STRING
  },
  secondary_colour: {
    type: Sequelize.STRING
  },
  theme_id: {
    type: Sequelize.INTEGER
  },
  social_share: {
    type: Sequelize.ARRAY(Sequelize.BOOLEAN)
  },
  facebook_message: {
    type: Sequelize.STRING
  },
  linkedin_message: {
    type: Sequelize.STRING
  },
  twitter_message: {
    type: Sequelize.STRING
  },
  instagram_message: {
    type: Sequelize.STRING
  },
  pinterest_message: {
    type: Sequelize.STRING
  },
  messanger_message: {
    type: Sequelize.STRING
  },
  whatsapp_message: {
    type: Sequelize.STRING
  }
  }, {
  hooks: {
  },
});

sequelize.sync()
  .then(() => console.log(`Table ${table} is created if one doesn't exist`))
  .catch(error => console.log('This error occured', error));

// export User model for use in other files.;
module.exports = Settings;

