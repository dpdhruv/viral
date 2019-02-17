var router = require('express').Router();
var logger = require('../config/winston');
var User = require('../models/user');
const { getJwt, prepareJWTCookies, jwtChecker } = require('../jwt_ops');
var User_coupon = require('../models/user_coupon');
var Coupon = require('../models/coupon');
var { sendSMS } = require('../message');

module.exports = function(app)  {
    
    router.get('/validation/coupon', (req, res) => {
        if(!req.err)    {
            if(!req.query.coupon || !req.query.user)    {
                res.status(400).send({ status: 'failure', message: 'coupon or user is not specified' });
            }   else    {
                User_coupon.findOne({
                   where: { user_id: req.query.user, coupon_id: req.query.coupon }
                }).then(
                    instance => {
                        if(!instance)   {
                            res.status(200).send({ status: 'success', message: 'No coupon found', action: 'invalid' })
                        }   else    {
                            Coupon.findOne({ where: { id: instance.coupon_id }}).then(
                                async coupon => {
                                    if(coupon.status == 'active')   {
                                        res.status(200).send({ status: 'success', message: 'Valid Coupon', action: 'valid'});
                                        let user = await User.findOne({ where : { username: instance.user_id }});
                                        sendSMS('You have used a coupon', 'VIRAL', user.phone_no);
                                        coupon.update({ status: 'expired' });
                                    }   else    {
                                        res.status(200).send({ status: 'success', message: 'Coupon has been used', action: 'used'});
                                    }
                                }
                            ).catch(err => { 
                                logger.error(err.message);  
                                res.status(500).send({ status: 'failure', message: 'Something went wrong.'});
                            })
                        }
                    }
                ).catch(
                    error => {
                        logger.error(error.message);
                        res.status(500).send({ status: 'failure', message: 'Something went wrong' });
                    }
                )
            }
        }   else    {
            res.status(401).send({ status: 'failure', message: 'Unauthorized Access' });
        }
    });

    return router;
}