var express = require('express');
var logger = require('./config/winston');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var db = require('./config/db');


const port = process.env.PORT || 8080;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// set morgan to log info about our requests for development use.
app.use(morgan('dev', { stream: logger.stream }));
app.use(cookieParser());
app.set('port', 8080);
var router = require('./routes/app_routes')(app);
app.use('/', router);


server = app.listen(port, () => {
    console.log(`Server started on ${server.address().port}`);
})

