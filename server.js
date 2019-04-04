var express = require('express');
var logger = require('./config/winston');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var db = require('./config/db');
var cors = require('cors');
var { add_dummy } = require('./dummy.js');

const port = process.env.PORT || 8080;
const app = express();
app.use(express.json());

// set morgan to log info about our requests for development use.
app.use(morgan('dev', { stream: logger.stream }));
app.use(cookieParser());
app.all('*', (req, res, next) => {
	// CORS headers
	res.header(
		'Access-Control-Allow-Origin',
		'https://viral123.herokuapp.com'
	);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Key, Authorization'
	);
	next();
});
app.set('port', 8080);
var router = require('./routes/app_routes')(app);
var admin_router = require('./routes/admin_route')(app);
var verification_router = require('./routes/verification_route')(app);
app.use('/', router);
app.use('/admin', admin_router);
app.use('/verification', verification_router);

add_dummy();

server = app.listen(port, () => {
    console.log(`Server started on ${server.address().port}`);
})

