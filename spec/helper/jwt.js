const { validJWT } = require('../../helper/jwt_ops');
const jwt = require('jsonwebtoken');
var key = require('../../config/crypto');


function setJWT(payload)    {
    var now = Date.now();
    payload.iat = now;
    return jwt.sign(payload, key);
}

function getJWT(res)    {
    return new Promise((resolve, reject) => {
        let cookies = res.headers["set-cookie"];
        if(!cookies)  {
            reject('No JWT cookies');
        }
        let count = 0, first, second;
        cookies.filter((value) => {
            let name = value.split(';')[0].split('=')[0];
            let val = value.split(';')[0].split('=')[1];
            if(name == 'access-token-1')    {
                first = val;
                count++;
            }   else if(name == 'access-token-2')   {
                second = val;
                count++;
            }
            if(count == 2)  { 
                jwt.verify(first + '.' + second, key, (err, decoded) => {
                
                    if(err)   {
                        reject('Invalid JWT received');
                    }   
                    if(!validJWT()) reject('Invalid JWT fields');
                    resolve(decoded);
                })
            }
        })
        reject('No JWT found');
    })
}

module.exports.getJWT = getJWT;