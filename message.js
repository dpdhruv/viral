var request = require('request');
var apikey = require('./config/message');

module.exports.sendSMS = async function (message, sender, number) {
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
