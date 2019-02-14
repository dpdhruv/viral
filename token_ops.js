const {OAuth2Client} = require('google-auth-library');


const CLIENT_ID = require('./config/token').TOKEN;
const client = new OAuth2Client(CLIENT_ID);

module.exports.verify = (token) => {
    return new Promise((resolve, reject) => {
      client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  
    }).then(
      data => {
        resolve(data.getPayload());
      }
    ).catch(
      error => { reject(error); }
    );
    });
}