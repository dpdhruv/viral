const Reward = require('./models/reward');

module.exports.add_dummy = async function()   {
    const count = await Reward.count({ });
    if(count == 0)  {
        Reward.create({
            campaign_id: 1,
            reward_id: 1,
            coupon_code: '21849243213',
            coupon_value: '10%',
            coupon_message: 'Christmas Offer',
            threshold: 12
        });
    }
}

