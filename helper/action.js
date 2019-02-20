var { createUser, createUserWithReferral } = require('../controllers/user');
var { encrypt, decrypt } = require('../helper/crypt');
const { removeJWT } = require('../helper/jwt_ops');
const { validJWT } = require('../controllers/jwt');
const logger = require('../config/winston');
const User = require('../models/user');
var { sendSMS } = require('../helper/message');
const { isValidPassword } = require('../helper/user');
const roles = require('../config/roles');

module.exports.signup = async function (req, res) {
    let decoded = req.decoded;
    let user = JSON.parse(decrypt(decoded.user));
    if(user.phone_no != req.otp_map_to) {
        res.status(400).send({ status: 'Failure', message: 'Otp doesn\' match with corresponding number'});
        return ;
    }
    let referral = decoded.referrel;
    if(!referral)    {
        if(!validJWT(roles.VERIFY_NEW_USER, decoded))  {
            removeJWT(res);
            res.status(400).send({ status: 'failure', mesage: 'Invalid fields in JWT'});   
            return;
        }        
        if(!await createUser(req, res, user))    {
            res.status(500).send({ status: 'failure', message: 'Something went wrong on the server'});
        }   else    {
            res.status(200).send({ status:  'success', message: 'New User created'});
        }
    }   else    {
        if(!validJWT(roles.VERIFY_REFERRAL_USER, decoded))  {
            removeJWT(res);
            res.status(400).send({ status: 'failure', mesage: 'Invalid fields in JWT'});   
            return;
        }        
        const response = await createUserWithReferral(req, res, user, referral);
        res.status(response.code).send(response.body);                
    }
}

module.exports.resetpassword = (req, res) => {
    if(!validJWT(roles.PASSWORD_RESET, req.decoded))  {
        removeJWT(res);
        res.status(400).send({ status: 'failure', mesage: 'Invalid fields in JWT'});   
        return;
    }
    let decoded = req.decoded.user;
    let user = { username: decoded.username, phone_no: decrypt(decoded.phone_no) };
    if(user.phone_no != req.otp_map_to) {
        res.status(400).send({ status: 'Failure', message: 'Otp doesn\' match with corresponding number'});
        return ;
    }
    if(!isValidPassword(req.body.password)) {
        res.status(400).send({ status: 'Failure', message: 'Invalid Password'});
        return ;
    }
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