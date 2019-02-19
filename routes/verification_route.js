var router = require('express').Router();
const { getJwt, prepareJWTCookies, jwtChecker, validJWT } = require('../helper/jwt_ops');
var { signup, resetpassword } = require('../helper/action');
var { otps, getReferralCode } = require('../models/otp_pool.js');


module.exports = function(app)  {
    router.post('/sms/:action', jwtChecker,async (req, res) => {
        if(!req.params.action || !req.body.otp)  {
            res.status(400).send({ status: 'failure', mesage: 'action or otp is not specified'});
        }   else    {
            let otp_map = otps.get(req.body.otp)
            if(!otp_map)  {
                res.status(401).send({ status: 'failure', message: 'Invalid Otp Obtained'});
                return;
            }
            req.otp_map_to = otp_map.to;
            otps.delete(req.body.otp);
            switch(req.params.action)   {
                case 'signup':
                    signup(req, res);
                    break
                case 'resetpassword':
                    resetpassword(req, res);
                    break
                default:
                    res.status(400).send({ status: 'failure', message: 'Invalid action provided'});
            }
        }
    });
    return router;
}