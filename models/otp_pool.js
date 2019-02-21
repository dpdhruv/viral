var voucher_codes = require('voucher-code-generator');
module.exports.otps = new Map();
let referrel_code = [];


module.exports.getOtp = function()  {
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