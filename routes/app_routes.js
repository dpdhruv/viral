var router = require('express').Router();
var logger = require('../config/winston');
var { sendSMS } = require('../helper/message');
const { getJwt, prepareJWTCookies, jwtChecker, removeJWT } = require('../helper/jwt_ops');
const { validJWT } = require('../controllers/jwt');
var { encrypt, decrypt } = require('../helper/crypt');
var User = require('../models/user');
var { otps, getOtp } = require('../models/otp_pool.js');
var {  isValidPhoneNumber } = require('../helper/user');
var roles = require('../config/roles');
var { signup } = require('../helper/action');


module.exports = function(app)  {
    router.get('/login', (req, res) => {
        res.status(200).send('Login Page');
    });

    router.get('/dashboard', jwtChecker, (req, res) => {
        if(!req.err)    {
            if(!validJWT(roles.USER, req.decoded))  {
                removeJWT(res);
                res.status(400).send({ status: 'failure', mesage: 'Invalid fields in JWT'});
            }
            res.send(200).send({ status: 'success', message: 'Okay'});
        } else  {
            res.status(401).send({ status: 'failure', message: 'Unauthorized Access'});
        }       
    });

    router.post('/getotp', async (req, res) => {
        console.log(`/getotp: ${req.body}`);
        if(!req.body.phone_no)   {
            res.status(400).send({ status: 'failure', message: 'Enter a phone number'});
        }   else if(!isValidPhoneNumber(req.body.phone_no))   {
            res.status(400).send({ status: 'failure', message: 'Enter a valid phone number'});
        }   else    {
            const count = await User.count({ where: { phone_no: req.body.phone_no }});
            if(count > 0)   {
                res.status(400).send({ status: 'failure', message: 'phone number exists'});
                return;
            }
            let otp = getOtp();
            logger.info(`OTP for phone verification at signup: ${otp} <----> ${req.body.phone_no}`);        
            sendSMS(`${otp} is your one time password for Sign up in viral`, req.body.phone_no);
            otps.set(otp, { created_at: Date.now, to: req.body.phone_no });
            res.status(200).send({ status: 'success', message: 'Otp sent for verification', otp: otp});
        }
    });

    router.post('/login', async (req, res) => {
        console.log(`/login: ${req.body}`);
        var username = req.body.username,
        password = req.body.password;
        User.findOne({ where: { username: username }}).then(function (user) {
        if (!user) {
            res.status(401).send({ status: 'failure', message: 'Invalid Username or password'});
        }
        else if (!user.validPassword(password)) {
            res.status(401).send({ status: 'failure', message: 'Invalid Username or password'});
        } else {
            const j = getJwt({ role: roles.USER , useruuid: user.username});
            prepareJWTCookies(j, res);
            res.status(200).send({ status: 'success', message: 'Successful Authentication'});
        }
        });
    });
    
    router.get('/signup', (req, res) => {
        console.log(`/signup: ${req.query}`);
        if(req.query.referral_id)   {
            User.findOne({where: { referral_token: req.query.referral_id }}).then(user => {
                if(!user)   {
                    res.status(412).send({ status: 'failure', message: 'Invalid referral id'});
                }   else    {        
                    prepareJWTCookies(getJwt({ role: roles.SIGNUP_REFERRAL, referrer: user.username, referral_token: user.referral_token }, 1*365*24*60*60*1000), res, 1*365*24*60*60*1000);
                    res.status(200).send({ status: 'success', message: 'sign up as with referral id' }) 
                }}).catch(err => {
                    logger.error(`DataBase Error: ${err.message}`);
                    res.status(500).send({ status: 'failure', message: 'Internal Server Error'});
                });
            }   else    {
            res.status(200).send({ status: 'success', message: 'sign up as a new user'});
        }
    });


    router.post('/signup', jwtChecker, async (req, res) => {
        console.log(`/signup: ${req.body}`);
        let otp_map = otps.get(req.body.otp)
        if(!otp_map)  {
            res.status(401).send({ status: 'failure', message: 'Invalid Otp Obtained'});
            return;
        }
        req.otp_map_to = otp_map.to;
        signup(req, res);
    });


    router.post('/resetpassword', (req, res) => {
        console.log(`/resetpassword: ${req.body}`);
        User.findOne({ where: { username: req.body.username }}).then((user) => {
            if(user)    {
                prepareJWTCookies(getJwt({ role: roles.PASSWORD_RESET, user: { username: user.username, phone_no: encrypt(user.phone_no) }}, 10*60*1000), res, 10*60*1000);
                let otp = getOtp();
                sendSMS(`${otp} is your one time password for Sign up in viral`, req.body.phone_no);
                otps.set(otp, { created_at: Date.now, to: user.phone_no });
                logger.info(`OTP for reset password: ${otp} <----> ${user.phone_no}`);
                res.status(200).send({ status: 'success', message: 'otp has been sent for verification', otp: otp});
            }   else{
                res.status.send({ status: 'failure', message: 'User doesn\'t exist'});
            }
        }).catch(err => {
            logger.error(err.message);
            res.status(400).send({ status: 'failure', message: 'Something went wrong'});
        })
    });

    return router;
}
