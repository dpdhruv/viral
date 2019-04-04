const jwt_schema = require('../models/jwt');
const Validator = require('schema-validator');
const roles = require('../config/roles');


module.exports.validJWT = function(role, jwt)   {
    if(!jwt.role || (jwt.role != role))   {
        return false;
    }
    let val = undefined;
    switch(role)  {
        case roles.USER:
            val = jwt_schema.USER_JWT;
            break;
        case roles.PASSWORD_RESET:
            val = jwt_schema.PASSWORD_RESET_JWT;
            break;
    }
    if(val) {
        var validator = new Validator(val);
        if(validator.check(jwt)._error)    {
            return false;
        }   else    return true;
    }
    return false;
}
