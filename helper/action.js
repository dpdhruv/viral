var { createUser, createUserWithReferral } = require('../controllers/user');
var { encrypt, decrypt } = require('../helper/crypt');
const { removeJWT } = require('../helper/jwt_ops');
const { validJWT } = require('../controllers/jwt');
const logger = require('../config/winston');
const User = require('../models/user');
var { check_user_details, isValidPhoneNumber } = require('../helper/user');
var { sendSMS } = require('../helper/message');
const { isValidPassword } = require('../helper/user');
const roles = require('../config/roles');

module.exports.signup = async function (req, res) {
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
    if(req.body.referral_code)   {
        User.findOne({where: { referral_token: req.body.referral_code }}).then(async usr => {
            if(!usr)   {
                res.status(412).send({ status: 'failure', message: 'Invalid referral code'});
            }   else    {
                user.referral_code = req.body.referral_code;
                user.referrer = usr.username;
                const response = await createUserWithReferral(req, res, user);
                res.status(response.code).send(response.body);           
            }
        })
    }  else    {
        if(!await createUser(req, res, user))    {
            res.status(500).send({ status: 'failure', message: 'Something went wrong on the server'});
        }   else    {
            res.status(200).send({ jwt: req.jwt, status:  'success', message: 'New User created'});
        }
    }
}

module.exports.resetpassword = (req, res) => {
    if(!validJWT(roles.PASSWORD_RESET, req.decoded))  {
        removeJWT(res);
        res.status(400).send({ status: 'failure', mesage: 'Invalid fields in JWT'});   
        return;
    }
    if(!isValidPassword(req.body.password)) {
        res.status(400).send({ status: 'Failure', message: 'Invalid Password'});
        return ;
    }
    let user = req.user;
    User.findOne({ where: { username: user.username }}).then(usr => {
        usr.update({ password: req.body.password }).then(ur => {
            sendSMS(`You just reset your password`, ur.phone_no);
            logger.info(`${ur.username}  changed password`);
            res.status(200).send({ status: 'success', message: 'Password Reset Successful'});
        }).catch(err => {
            logger.error(err.message);
            res.status(500).send({ status: 'failure', message: 'Something went wrong'});
        });
    }).catch(err => {
        logger.error(err.message);
        res.status(500).send({ status: 'failure', message: 'Something went wrong'});
    });
}