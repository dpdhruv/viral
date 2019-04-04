const crypto = require('crypto');

module.exports.encrypt = function (user)   {
    const cipher = crypto.createCipher('aes256', key);
    let encrypted = cipher.update(user, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
}

module.exports.decrypt = function (user)  {
    let decipher = crypto.createDecipher("aes256", key);
    let dec = decipher.update(user, "hex", "utf8");
    dec += decipher.final("utf8");
    return dec;
}