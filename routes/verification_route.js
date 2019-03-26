var router = require('express').Router();
const { getJwt, prepareJWTCookies, jwtChecker } = require('../helper/jwt_ops');
var { signup, resetpassword } = require('../helper/action');
var { getOtpMap } = require('../controllers/otp_ops');
var {  decrypt } = require('../helper/crypt');


module.exports = function(app)  {
    router.post('/sms/:action', jwtChecker,async (req, res) => {
        console.log(`/verification/sms/`, req.body);
        if(!req.params.action || !req.body.otp)  {
            res.status(400).send({ status: 'failure', mesage: 'action or otp is not specified'});
        }   else    {
            if(req.err) {
                res.status(401).send({ status: 'failure', message: 'Invalid or no JWT received'});
                return
            }
            let decoded = req.decoded.user;
            let user = { username: decoded.username, phone_no: decrypt(decoded.phone_no) };
            req.user = user;
            let otp_map = getOtpMap(user.phone_no);
            if(!otp_map)  {
                res.status(401).send({ status: 'failure', message: 'Invalid Otp Obtained'});
                return;
            }
            req.otp_map = otp_map.phone_no;
            switch(req.params.action)   {
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