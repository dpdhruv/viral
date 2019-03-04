
module.exports = class Otp   {
    constructor(otp, phone_no, expiry, attempts)    {
        this.otp = otp;
        this.phone_no = phone_no;
        this.expiry = expiry;
        this.attempts = attempts;
    }
}
