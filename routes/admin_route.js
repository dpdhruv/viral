var router = require('express').Router();
var logger = require('../config/winston');
var User = require('../models/user');
const { getJwt, prepareJWTCookies, jwtChecker } = require('../helper/jwt_ops');
var User_coupon = require('../models/user_coupon');
var Coupon = require('../models/coupon');
var { sendSMS } = require('../helper/message');

module.exports = function(app)  {
    
    router.post('/validation/redeem',async (req, res) => {
        console.log(`/validation/redeem`, req.body);
        if(!req.err)    {
            if(!req.body.coupon || !req.body.user)    {
                res.status(400).send({ status: 'failure', message: 'coupon or user is not specified' });
            }   else    {
                User_coupon.findOne({ where: { user_id: req.body.user, coupon_id: req.body.coupon }}).then(instance => {
                if(!instance)   {
                    res.status(200).send({ status: 'success', message: 'No coupon found', action: 'invalid' })
                }   else    {
                    Coupon.findOne({ where: { id: instance.coupon_id }}).then(async coupon => {
                    if(coupon.status == 'active')   {
                        res.status(200).send({ status: 'success', message: 'Valid Coupon', action: 'valid'});
                        let user = await User.findOne({ where : { username: instance.user_id }});
                        logger.info(`${coupon.id} was redeemed.`);
                        sendSMS('You have used a coupon', user.dataValues.phone_no);
                        coupon.update({ status: 'expired' });
                    }   else    {
                        res.status(200).send({ status: 'success', message: 'Coupon has been used', action: 'used'});
                    }}).catch(err => { 
                        logger.error(err.message);  
                        res.status(500).send({ status: 'failure', message: 'Something went wrong.'});
                    })}}).catch(error => {
                    logger.error(error.message);
                    res.status(500).send({ status: 'failure', message: 'Something went wrong' });
                })
            }}  else    {
            res.status(401).send({ status: 'failure', message: 'Unauthorized Access' });
            }
    });


    router.get('/coupons/:userid', async (req, res) => {
        let pairs = await User_coupon.findAll({ where: { user_id: req.params.userid}});
        coupons = [];
        for(let i = 0; i < pairs.length; i++)   {
            let coupon = await Coupon.findOne({ where: { id: pairs[i].dataValues.coupon_id}})
            coupons.push(coupon.dataValues);
        }
        res.send(coupons);
    });

    router.get('/coupons',async (req, res) => {
        let coupons = await Coupon.findAll({});
        res.send(coupons);
    });

    return router;
}