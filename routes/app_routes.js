var router = require('express').Router();
var logger = require('../config/winston');
var { sendSMS } = require('../helper/message');
const { getJwt, prepareJWTCookies, jwtChecker, validJWT } = require('../helper/jwt_ops');
var voucher_codes = require('voucher-code-generator');
var { encrypt, decrypt } = require('../helper/crypt');
var { check_user_details } = require('../helper/user');
var User = require('../models/user');
var { signup, resetpassword } = require('../helper/action');
var { otps, getReferralCode } = require('../models/otp_pool.js');


module.exports = function(app)  {
    router.get('/login', (req, res) => {
        res.status(200).send('Login Page');
    });

    router.get('/dashboard', jwtChecker, (req, res) => {
        if(!req.err)    {
            if(!validJWT(req.decoded))  {
                res.status(400).send({ status: 'failure', mesage: 'Invalid fields in JWT'});
                    return;
            }
            res.send(200).send({ status: 'success', message: 'Okay'});
        } else  {
            res.status(401).send({ status: 'failure', message: 'Unauthorized Access'});
        }       
    });

    router.post('/login', async (req, res) => {
        var username = req.body.username,
        password = req.body.password;
        User.findOne({ where: { username: username }}).then(function (user) {
        if (!user) {
            res.status(401).send({ status: 'failure', message: 'Invalid Username or password'});
        }
        else if (!user.validPassword(password)) {
            res.status(401).send({ status: 'failure', message: 'Invalid Username or password'});
        } else {
            const j = getJwt({ role: 'user', useruuid: user.username});
            prepareJWTCookies(j, res);
            res.status(200).send({ status: 'success', message: 'Successful Authentication'});
        }
        });
    });
    
    router.get('/signup', (req, res) => {
        if(req.query.referral_id)   {
            User.findOne({where: { referral_token: req.query.referral_id }}).then(user => {
                if(!user)   {
                    res.status(412).send({ status: 'failure', message: 'Invalid referral id'});
                }   else    {        
                    prepareJWTCookies(getJwt({ role: 'signup_referral', referrer: user.username, referral_token: user.referral_token }, 1*365*24*60*60*1000), res, 1*365*24*60*60*1000);
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
        user = {
            username: req.body.username,
            password: req.body.password,
            name: req.body.name,
            phone_no: req.body.phone_no
        }
        let message = await check_user_details(user);
        if(message) {
            res.status(406).send({ status: 'failure', message: message} );
            return;
        }
        if(!req.err)    {
            if(!validJWT(req.decoded))   {
                res.status(400).send({ status: 'failure', mesage: 'Invalid fields in JWT'});
                return;
            }
            prepareJWTCookies(getJwt({ role: 'verify_referral_user', user: encrypt(JSON.stringify(user)),  referrel: { referrer: req.decoded.referrer, referral_token:  req.decoded.referral_token }}, 10*60), res, 10*60*1000);
        }   else if(req.err.code == 103)   {
                prepareJWTCookies(getJwt({ role: 'verify_new_user', user: encrypt(JSON.stringify(user)) }, 10*60*1000), res, 10*60*1000);
        }   else    {
                if(!validJWT(req.decoded))   {
                    res.status(400).send({ status: 'failure', mesage: 'Invalid fields in JWT'});
                    return;
                }
                prepareJWTCookies(getJwt({ role: 'verify_referral_user', user: encrypt(JSON.stringify(user)),  referrel: { referrer: req.decoded.referrer, referral_token: req.decoded.referral_token }}, 10*60*1000), res, 10*60*1000);
        }
        const otp = getReferralCode();
        logger.info(`OTP for phone verification at signup: ${otp} <----> ${user.phone_no}`);        
        sendSMS(`${otp} is your one time password for Sign up in viral`, req.body.phone_no);
        otps.set(otp, { created_at: Date.now, to: user.phone_no });
        res.status(200).send({ status: 'success', message: 'otp has been sent for verification'});
    });


    router.post('/resetpassword', (req, res) => {
        User.findOne({ where: { username: req.body.username }}).then((user) => {
            if(user)    {
                prepareJWTCookies(getJwt({ role: 'password_reset', user: { username: user.username, phone_no: encrypt(user.phone_no) }}, 10*60*1000), res, 10*60*1000);
                let otp = getReferralCode();
                sendSMS(`${otp} is your one time password for Sign up in viral`, req.body.phone_no);
                otps.set(otp, { created_at: Date.now, to: user.phone_no });
                logger.info(`OTP for reset password: ${otp} <----> ${user.phone_no}`);
                res.status(200).send({ status: 'success', message: 'otp has been sent for verification'});
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
