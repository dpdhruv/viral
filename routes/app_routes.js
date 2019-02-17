var router = require('express').Router();
var path = require('path');
var logger = require('../config/winston');
const cookie = require('cookie-parser');
var User = require('../models/user');
var Referral = require('../models/referral');
var Coupon = require('../models/coupon');
var Offer = require('../models/offer');
var { sendSMS } = require('../message');
const key = require('../config/crypto');
const { getJwt, prepareJWTCookies, jwtChecker } = require('../jwt_ops');
var voucher_codes = require('voucher-code-generator');
var { encrypt, decrypt } = require('../crypt');

let otps = new Map();
let referrel_code = [];


function getReferralCode()  {
    let code = referrel_code.pop();
    if(!code)   {
        referrel_code = voucher_codes.generate({
            length: 6,
            count: 1000,
            charset: "0123456789"
        })
        return referrel_code.pop();
    }
    return code;
}


module.exports = function(app)  {
    router.get('/login', (req, res) => {
        res.sendFile(path.resolve('public/index.html'));
    });

    router.get('/dashboard', jwtChecker, (req, res) => {
        if(!req.err)    {
            res.send(200).send({ status: 'success', message: 'Okay'});
        } else  {
            res.status(401).send({ status: 'failure', message: 'Unauthorized Access'});
        }       
    });

    router.post('/login', (req, res) => {
        var username = req.body.username,
        password = req.body.password;
        User.findOne({ where: { username: username } }).then(function (user) {
        if (!user) {
            res.status(401).send({ status: 'failure', message: 'Invalid Username or password'});
        }
        else if (!user.validPassword(password)) {
            res.status(401).send({ status: 'failure', message: 'Invalid Username or password'});
        } else {
            const j = getJwt({ role: 'user', useruuid: user.username});
            prepareJWTCookies(j, res);
            res.status(200).send({ status: 'success', message: 'Successfull Authentication'});
        }
        });
    });
    
    router.get('/signup', (req, res) => {
        if(req.query.referral_id)   {
            User.findOne({where: { referral_token: req.query.referral_id }}).then(
                user => {
                    if(!user)   {
                        res.status(412).send({ status: 'failure', message: 'Invalid referral id'});
                    }   else    {        
                        prepareJWTCookies(getJwt({ role: 'signup', referrer: user.username, referral_token: user.referral_token }, 1*365*24*60*60*1000), res, 1*365*24*60*60*1000);
                        res.status(200).send({ status: 'success', message: 'sign up as with referral id' }) 
                    }
                }
            ).catch(err => {
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
        const otp = getReferralCode();
        logger.info(`OTP for phone verification at signup: ${otp} <----> ${user.phone_no}`);
        if(!req.err && req.decoded.referrer && req.decoded.referral_token)    {
            prepareJWTCookies(getJwt({ role: 'verify_user', 
            user: encrypt(JSON.stringify(user)),  referrel: { referrer: req.decoded.referrer, referral_token:  req.decoded.referral_token }}, 10*60), res, 10*60*1000);
        }   else    {
            if(req.err.code == 103) {
                prepareJWTCookies(getJwt({ role: 'verify_user', user: encrypt(JSON.stringify(user)) }, 10*60*1000), res, 10*60*1000);
            }   else if(req.decoded.referrer && req.decoded.referral_token)    {
                prepareJWTCookies(getJwt({ role: 'verify_user', user: encrypt(JSON.stringify(user)),  referrel: { referrer: req.decoded.referrer, referral_token: req.decoded.referral_token }}, 10*60*1000), res, 10*60*1000);
            }
        }
        sendSMS(`${otp} is your one time password for Sign up in viral`, req.body.phone_no);
        otps.set(otp, { created_at: Date.now, to: user.phone_no });
        res.status(200).send({ status: 'success', message: 'otp has been sent for verification'});

    });

    router.post('/verification/sms/:action', jwtChecker,async (req, res) => {
        if(!req.params.action || !req.body.otp)  {
            res.status(400).send({ status: 'failure', mesage: 'action or otp is not specified'});
        }   else    {
            let otp_map = otps.get(req.body.otp)
            if(!otp_map)  {
                res.status(401).send({ status: 'failure', message: 'Invalid Otp Obtained'});
                return;
            }
            otps.delete(req.body.otp);
            let decoded = undefined;
            let user = undefined;
            switch(req.params.action)   {
                case 'signup':
                    decoded = req.decoded;
                    console.log(decoded);
                    user = JSON.parse(decrypt(decoded.user));
                    if(user.phone_no != otp_map.to) {
                        res.status(400).send({ status: 'Failure', message: 'Otp doesn\' match with corresponding number'});
                        return ;
                    }
                    let referral = decoded.referrel;
                    if(!referral)    {
                        if(!await createUser(user))    {
                            res.status(500).send({ status: 'failure', message: 'Something went wrong on the server'});
                        }   else    {
                            res.status(200).send({ status: 'success', message: 'New User created'});
                        }
                    }   else    {
                        const response = await createUserWithReferral(user, referral);
                        res.status(response.code).send(response.body);                
                    }
                    break
                case 'resetpassword':
                    decoded = req.decoded.user;
                    user = { username: decoded.username, phone_no: decrypt(decoded.phone_no) };
                    if(user.phone_no != otp_map.to) {
                        res.status(400).send({ status: 'Failure', message: 'Otp doesn\' match with corresponding number'});
                        return ;
                    }
                    User.findOne({ where: { username: user.username }}).then(
                        usr => {
                            usr.update({ password: req.body.password }).then(
                                ur => {
                                    res.status(200).send({ status: 'success', message: 'Password Reset Successful'});
                                }
                            ).catch(err => {
                                logger.error(err.message);
                                res.status(500).send({ status: 'failure', message: 'Something went wrong'});
                            });
                        }
                    ).catch(err => {
                        logger.error(err.message);
                        res.status(500).send({ status: 'failure', message: 'Something went wrong'});
                    });
                    break
                default:
                    res.status(400).send({ status: 'failure', message: 'Invalid action provided'});
            }
        }
        
        
        async function createUserWithReferral(user, referral) {
            return await new Promise(async (resolve) => {
                if(!referral.referrer || !referral.referral_token)    {
                    resolve({ code: 401, body: { status: 'failure', message: 'Invalid JWT Received'}});
                    return;
                }
                let usr = await createUser(user);
                if(!usr)    {
                    resolve({ code: 500, body: { status: 'failure', message: 'Something went wrong on the server'}});
                }
                else    {
                    Referral.create({
                        user_id: referral.referrer,
                        referral_id: referral.referral_token,
                        referred_to: usr.username
                    }).then(referrel => {
                        logger.info(`New Referral entry: ${referrel}`);
                        resolve({ code: 200, body: { status: 'success', message: 'New User Created with referrel'}});
                    }).catch(err => {
                        logger.error(err);
                        resolve({ code: 500, body: { status: 'failure', message: 'Something went wrong on the Server'}});
                    });
                }
            })
        }
        

        async function createUser(user)   {
            return await new Promise((resolve) => {
                User.create({
                    username: user.username,
                    phone_no: user.phone_no,
                    name: user.name,
                    password: user.password,
                })
                .then(usr => {
                    const j = getJwt({ role: 'user', useruuid: usr.username });
                    prepareJWTCookies(j, res);
                    resolve(usr);
                })
                .catch(error => {
                    console.error(error);
                    resolve();
                });
            })
        }
    });


    router.post('/resetpassword', (req, res) => {
        User.findOne({ where: { username: req.body.username }}).then(
            user => {
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
            }
        ).catch(err => {
            logger.error(err.message);
            res.status(400).send({ status: 'failure', message: 'Something went wrong'});
        })
    });

    return router;
}