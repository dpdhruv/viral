const key = require('../config/crypto');
var jwt_config = require('../config/jwt');
const jwt = require('jsonwebtoken');

module.exports.prepareJWTCookies = function (jwt, res, maxAge)  {
    const first = jwt.split('.')[0] + '.' + jwt.split('.')[1];
    const second = jwt.split('.')[2];
    if(!maxAge) {
        maxAge = jwt_config.expiry * 1000;
    }
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
    if(!req.cookies["access-token-1"] || !req.cookies["access-token-2"])    {
        req.err = { status: 'failure', code: 103, 'message': 'No JWT found'};
        next();
        return;
    }
    const j = req.cookies["access-token-1"] + "." + req.cookies["access-token-2"];
    jwt.verify(j, key, (err, decoded) => {
        if(err) {
            res.clearCookie('access-token-1');
            res.clearCookie('access-token-2');
            req.err = { status: 'failure', code: 100, message: 'verification failed' }
        }
        else    {
            if(Date.now() >= decoded.exp)   {
                req.decoded = decoded;
                res.clearCookie('access-token-1');
                res.clearCookie('access-token-2');
                req.err = { status: 'failure', code: 101, message: 'jwt expired' }
            }
            else    {
                req.decoded = decoded;
            }
        }
    })
    next();
};