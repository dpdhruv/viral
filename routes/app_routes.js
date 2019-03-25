var router = require('express').Router();
var logger = require('../config/winston');
var { sendSMS } = require('../helper/message');
const { getJwt, prepareJWTCookies, jwtChecker, removeJWT } = require('../helper/jwt_ops');
const { validJWT } = require('../controllers/jwt');
var { encrypt, decrypt } = require('../helper/crypt');
var User = require('../models/user');
var User_coupon = require('../models/user_coupon')
var {  isValidPhoneNumber } = require('../helper/user');
var roles = require('../config/roles');
var { signup } = require('../helper/action');
var { getOtp, getOtpMap } = require('../controllers/otp_ops');


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
        console.log(`/getotp`, req.body);
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
            let otp = getOtp(req.body.phone_no, res);
            if(otp)    {
                logger.info(`OTP for phone verification at signup: ${otp} <----> ${req.body.phone_no}`);        
                sendSMS(`${otp} is your one time password for Sign up in viral`, req.body.phone_no);
                res.status(200).send({ status: 'success', message: 'Otp sent for verification', otp: otp});
            }
        }
    });

    router.post('/login', async (req, res) => {
        console.log(`/login`, req.body);
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
            prepareJWTCookies(j, res, req);
            res.status(200).send({ jwt: req.jwt, status: 'success', message: 'Successful Authentication'});
        }
        });
    });


    router.post('/signup', async (req, res) => {
        console.log(`/signup`, req.body);
        let otp_map = getOtpMap(req.body.phone_no);
        console.log(otp_map);
        if(!otp_map)  {
            res.status(401).send({ status: 'failure', message: 'Invalid Otp Obtained'});
            return;
        }
        req.otp = otp_map.phone_no;
        signup(req, res);
    });

    router.get('/coupons', jwtChecker, async (req, res) => {
        if(req.err) {
            res.status(401).send({ status: 'failure', message: 'Unauthorized'});
        }  else if(!validJWT(roles.USER, req.decoded))  {
            res.status({ status: 'failure', message: 'Invalid JWT'})
        }  else {
            let pairs = await User_coupon.findAll({ where: { user_id: req.decoded.useruuid }});
            coupons = [];
            for(let i = 0; i < pairs.length; i++)   {
                let coupon = await Coupon.findOne({ where: { id: pairs[i].dataValues.coupon_id}})
                coupons.push(coupon.dataValues);
            }
            res.send({ status: "success",  message: "", coupons: coupons});
        }
    })

    router.post('/resetpassword', (req, res) => {
        console.log(`/resetpassword`, req.body);
        User.findOne({ where: { username: req.body.username }}).then((user) => {
            if(user)    {
                prepareJWTCookies(getJwt({ role: roles.PASSWORD_RESET, user: { username: user.username, phone_no: encrypt(user.phone_no) }}, 10*60*1000), res, req, 10*60*1000);
                let otp = getOtp(user.phone_no, res);
                if(otp) {
                    sendSMS(`${otp} is your one time password for Sign up in viral`, req.body.phone_no);
                    logger.info(`OTP for reset password: ${otp} <----> ${user.phone_no}`);
                    res.status(200).send({ jwt: req.jwt, status: 'success', message: 'otp has been sent for verification', otp: otp});
                }
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
