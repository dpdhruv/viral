var request = require('request');
var { apikey, sender } = require('../config/message');

module.exports.sendSMS = function() {}

sdf = async function (message, number) {
    var url = `https://api.textlocal.in/send?apikey=${apikey}&message=${message}&sender=${sender}&numbers=${number}`;
    return await new Promise((resolve, reject) => {
        request.get(url, (err, data, body) => {
            if(err) {
                reject(err);
            }else   {
                resolve(body);
            }
        })
    })
}
