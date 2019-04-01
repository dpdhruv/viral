const { getJwt, prepareJWTCookies } = require('../helper/jwt_ops');
const { sendSMS } = require('../helper/message');
const User = require('../models/user');
var Referral = require('../models/referral');
var logger = require('../config/winston');
var Coupon = require('../models/coupon');
var User_coupon = require('../models/user_coupon');
var Reward = require('../models/reward');
var roles = require('../config/roles')

async function createUserWithReferral(req, res, user) {
    return await new Promise(async (resolve) => {
        let usr = await createUser(req, res, user);
        if(!usr)    {
            resolve({ code: 500, body: { status: 'failure', message: 'Something went wrong on the server'}});
        }
        else    {
            Referral.create({
                user_id: user.referrer,
                referral_id: user.referral_code,
                referred_to: user.username
            }).then(async referrel => {
                logger.info(`New Referral entry: ${user.referrer} ---> ${usr.username}`);
                referrer = await User.findOne({ where: { username: referrel.user_id }});
                sendSMS(`${usr.name} has just signed up`, referrer.dataValues.phone_no);
                let coupons_got = await User_coupon.count({ where: { user_id: referrer.dataValues.username }});
                let reward = await Reward.findOne({ where: { campaign_id: 1, reward_id: 1}});
                if(coupons_got < reward.dataValues.threshold)    {
                    let coupon = await Coupon.create({ code: reward.dataValues.coupon_code, coupon_value: reward.dataValues.coupon_value, coupon_message: reward.dataValues.coupon_message })
                    logger.info(`New coupon given to ${referrer.dataValues.username}`);
                    sendSMS('You have got a coupon.', referrer.dataValues.phone_no);
                    User_coupon.create({
                        user_id: referrer.dataValues.username,
                        referrer_id: usr.username,
                        coupon_id: coupon.dataValues.id
                    })
//                    referrer.update({ referral_status: 'expired'});
                }
                resolve({ code: 200, body: { jwt: req.jwt , status: 'success', message: 'New User Created with referrel'}});
            }).catch(err => {
                logger.error(err);
                resolve({ code: 500, body: { status: 'failure', message: 'Something went wrong on the Server'}});
            });
        }
    })
}

async function createUser(req, res, user)   {
    return await new Promise((resolve) => {
        User.create({
            username: user.username,
            phone_no: user.phone_no,
            name: user.name,
            password: user.password,
        }).then(usr => {
            const j = getJwt({ role: roles.USER, useruuid: usr.username });
            prepareJWTCookies(j, res, req);
            logger.info(`New User created: ${user}`);
            sendSMS('Thank you for Signing up', usr.phone_no);
            resolve(usr);
        })
        .catch(error => {                    
            logger.error(`${error}`);
            resolve();
        });
    })
}


module.exports.createUser = createUser;
module.exports.createUserWithReferral = createUserWithReferral;