var router = require('express').Router();
var logger = require('../config/winston');
var User = require('../models/user');
const { getJwt, prepareJWTCookies, jwtChecker } = require('../jwt_ops');
var User_coupon = require('../models/user_coupon');
var Coupon = require('../models/coupon');
var { sendSMS } = require('../message');
var Sales = require('../models/sales');
var Referral = require('../models/referral');
const Reward = require('../models/reward');

module.exports = function(app)  {

    router.get('/checkout', jwtChecker, async (req, res) => {
        let username = req.decoded.useruuid;        
        /***************************************** 
         * Code to add items to sales table
         * send message that user has 
         * purchased items..
        ******************************************/
        let message = 'checkedout\n';
        let referrer = await Referral.findOne({ where: { referred_to: username }});
        if(referrer)    {
            let referrer_user = await User.findOne({ where: { username: referrer.dataValues.user_id }});
            let count = await Sales.count({ where: { user_id: username }});
            if(count == 1)  {
                let curr_user = await User.findOne({ where: { username: username }});
                sendSMS(`The user ${curr_user.dataValues.name} you referred had his/her first purchase.`, referrer_user.dataValues.phone_no);
                message += 'First purchase\n';
            }
            if(referrer.dataValues.referral_status == 'active')      {
                let reward = await Reward.findOne({ where: { campaign_id: 1, reward_id: 1}});
                if(count >= reward.dataValues.threshold)   {
                    sendSMS('You have got a coupon.', referrer_user.dataValues.phone_no);
                    let coupon = await Coupon.findOne({ where: { id: reward.dataValues.coupon }})
                    let copy_coupon = await Coupon.create({ code: coupon.dataValues.code, coupon_value: coupon.dataValues.coupon_value, coupon_message: coupon.dataValues.coupon_message });
                    User_coupon.create({
                        user_id: referrer.dataValues.user_id,
                        referrer_id: username,
                        coupon_id: copy_coupon.dataValues.id
                    })
                    referrer.update({ referral_status: 'expired'});
                    message += 'Referrer gets coupon';
                }
            }
        }
        res.status(200).send({ status: 'success', message: message});
    });

    return router;
}