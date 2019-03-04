const { allowed_attempts, expiration_time } = require('../config/otp');
const Otp = require('../models/otp');
var voucher_codes = require('voucher-code-generator');
let otps = new Map();
let referrel_code = [];

function getotp()  {
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


module.exports.getOtp = (phone_no, res) => {
    let map = otps.get(phone_no);
    if(!map)    {
        let otp = getotp();
        otps.set(phone_no, new Otp(otp , phone_no, Date.now() + expiration_time * 60, 0));
        return otp;
    }   else    {
        if(map.attempts < allowed_attempts)   {
            map.expiry = expiration_time * 60 + Date.now();
            map.attempts += allowed_attempts;
            return map.otp;
        }   else    {
            res.status(405).send({ status: 'failure', message: 'Try After sometime'});
        }
    }
    return null;
}

module.exports.getOtpMap = (phone_no) => {
    let map = otps.get(phone_no);
    return map;
};

setInterval(() => {
    otps.forEach((value, key) => {
        if(Date.now() >= value.expiry)  otps.delete(key);
    });
}, 60000);