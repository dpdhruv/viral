const key = require('../config/crypto');
var jwt_config = require('../config/jwt');
const jwt = require('jsonwebtoken');
const roles = require('../config/roles');

module.exports.prepareJWTCookies = function (jwt, res, req,  maxAge)  {
    const first = jwt.split('.')[0] + '.' + jwt.split('.')[1];
    const second = jwt.split('.')[2];
    if(!maxAge) {
        maxAge = jwt_config.expiry * 1000;
    }
    req.jwt = jwt;
    res.cookie('access-token-1', first, { maxAge: maxAge, httpOnly: false});
    res.cookie('access-token-2', second, { maxAge: maxAge, httpOnly: false});
}

module.exports.getJwt = function(payload, time)   {
    var now = Date.now();
    payload.iat = now;
    if(time)    {
        jwt_config.header.expiresIn = time;
    } else  {
        jwt_config.header.expiresIn = jwt_config.expiry
    }
    return jwt.sign(payload, key, jwt_config.header);
}

module.exports.jwtChecker = function (req, res, next)   {
    if(!req.headers["access-token"])    {
        req.err = { status: 'failure', code: 103, 'message': 'No JWT found'};
        next();
        return;
    }
    const j = req.headers["access-token"]
    jwt.verify(j, key, (err, decoded) => {
        if(err) {
            req.err = { status: 'failure', code: 100, message: 'jwt verification failed' }
        }
        else    {
            if(Date.now() >= decoded.exp)   {
                req.decoded = decoded;
                req.err = { status: 'failure', code: 101, message: 'jwt expired' }
            }
            else    {
                req.decoded = decoded;
            }
        }
    })
    next();
};


module.exports.removeJWT = function(res)    {
}