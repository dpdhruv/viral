var router = require('express').Router();
var Settings = require('../models/settings')
var settings = require('../config/settings')
var logger = require('../config/winston');
var User = require('../models/user');
const { getJwt, prepareJWTCookies, jwtChecker } = require('../helper/jwt_ops');
var User_coupon = require('../models/user_coupon');
var Coupon = require('../models/coupon');
var { sendSMS } = require('../helper/message');
var multer = require('multer')

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

    router.get('/settings/coupons',async (req, res) => {
        let coupons = await Coupon.findAll({});
        res.send(coupons);
    });

    router.get('/settings/business',async (req, res, next) => {
        Settings.findOne({}).then(s => {
            res.send(s.business)
        }).catch(next)
    });

    router.get('/settings/website',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.website)
            }).catch(next)
        });

    router.get('/settings/name',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.name)
            }).catch(next)
        });

    router.get('/settings/tag',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.tag)
            }).catch(next)
        });

    router.get('/settings/email',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.email)
            }).catch(next)
        });

    router.get('/settings/phone_no',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.phone_no)
            }).catch(next)
        });

    router.get('/settings/image',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.image)
            }).catch(next)
        });

    router.get('/settings/primary_colour',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.primary_colour)
            }).catch(next)
        });

    router.get('/settings/secondary_colour',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.secondary_colour)
            }).catch(next)
        });

    router.get('/settings/theme_id',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.theme_id)
            }).catch(next)
        });

    router.get('/settings/social_share',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.social_share)
            }).catch(next)
        });

    router.get('/settings/facebook_message',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.facebook_message)
            }).catch(next)
        });

    router.get('/settings/linkedin_message',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.linkedin_message)
            }).catch(next)
        });

    router.get('/settings/twitter_message',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.twitter_message)
            }).catch(next)
        });

    router.get('/settings/instagram_message',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.instagram_message)
            }).catch(next)
        });

    router.get('/settings/pinterest_message',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.pinterest_message)
            }).catch(next)
        });

    router.get('/settings/messanger_message',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.messanger_message)
            }).catch(next)
        });

    router.get('/settings/whatsapp_message',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                res.send(s.whatsapp_message)
            }).catch(next)
        });

        router.post('/settings/business',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.business = req.body.business
                s.save()
                res.send({ business: s.business })
            })
        });
    
    router.post('/settings/website',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.website = req.body.website
                s.save()
                res.send({ website: s.website })
            })
        });
    
    router.post('/settings/name',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.name = req.body.name
                s.save()
                res.send({ name: s.name })
            })
        });
    
    router.post('/settings/tag',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.tag = req.body.tag
                s.save()
                res.send({ tag: s.tag })
            })
        });
    
    router.post('/settings/email',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.email = req.body.email
                s.save()
                res.send({ email: s.email })
            })
        });
    
    router.post('/settings/phone_no',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.phone_no = req.body.phone_no
                s.save()
                res.send({ phone_no: s.phone_no })
            })
        });
    
    router.post('/settings/image',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.image = req.body.image
                s.save()
                res.send({ image: s.image })
            })
        });
    
    router.post('/settings/primary_colour',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.primary_colour = req.body.primary_colour
                s.save()
                res.send({ primary_colour: s.primary_colour })
            })
        });
    
    router.post('/settings/secondary_colour',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.secondary_colour = req.body.secondary_colour
                s.save()
                res.send({ secondary_colour: s.secondary_colour })
            })
        });
    
    router.post('/settings/theme_id',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.theme_id = req.body.theme_id
                s.save()
                res.send({ theme_id: s.theme_id })
            })
        });
    
    router.post('/settings/social_share',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.social_share = req.body.social_share
                s.save()
                res.send({ social_share: s.social_share })
            })
        });
    
    router.post('/settings/facebook_message',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.facebook_message = req.body.facebook_message
                s.save()
                res.send({ facebook_message: s.facebook_message })
            })
        });
    
    router.post('/settings/linkedin_message',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.linkedin_message = req.body.linkedin_message
                s.save()
                res.send({ linkedin_message: s.linkedin_message })
            })
        });
    
    router.post('/settings/twitter_message',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.twitter_message = req.body.twitter_message
                s.save()
                res.send({ twitter_message: s.twitter_message })
            })
        });
    
    router.post('/settings/instagram_message',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.instagram_message = req.body.instagram_message
                s.save()
                res.send({ instagram_message: s.instagram_message })
            })
        });
    
    router.post('/settings/pinterest_message',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.pinterest_message = req.body.pinterest_message
                s.save()
                res.send({ pinterest_message: s.pinterest_message })
            })
        });
    
    router.post('/settings/messanger_message',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.messanger_message = req.body.messanger_message
                s.save()
                res.send({ messanger_message: s.messanger_message })
            })
        });
    
    router.post('/settings/whatsapp_message',async (req, res, next) => {
            Settings.findOne({}).then(s => {
                s.whatsapp_message = req.body.whatsapp_message
                s.save()
                res.send({ whatsapp_message: s.whatsapp_message })
            })
        });
    
    
    router.post('/settings/social_share/:action',async (req, res, next) => {
        const action = req.params.action
        if(action != 'enable' && action != 'disable') {
            res.status(400).send('Invalid Action Provided')
            return
        }
        const media = req.body
        Settings.findOne({}).then(s => {
                media_list = s.social_share
                media.forEach(item => {
                    if(item < 0 || item >= Object.keys(settings.admin.social_share).length)  {
                        next('Invalid list item')
                    }
                    media_list[item] = action == 'enable' ? true : false
                })
                s.social_share = media_list
                s.save()
                res.send(s.social_share)
            })
        });
    

    router.post('/settings/coupons', async (req, res, next) => {
        let coupon = req.body
        var upload = multer({ dest: 'public/images/coupons'})
        upload.array('files', 12)
        Coupon.create(coupon).then(c => {
            res.send(c)
        }).catch(next)
    }); 

    router.patch('/settings/coupons/:id', async (req, res, next) => {
        let coupon = req.body
        let id = req.params.id
        Coupon.findOne({ where : { id }}).then(c => {
            if(!c)  {
                res.send({ status: 'failure', message: 'No Such Coupon'})
            }   else    {
                Object.keys(coupon).forEach(key => {
                    switch(key) {
                        case 'available_on':
                            if(coupon[key].length > Object.keys(settings.coupon.available_on).length)    {
                                res.send({ status: 'failure', message: 'Invalid available_on field value'})
                                return
                            }
                            c[key] = coupon[key]
                            break
                        case 'available_to':
                            if(coupon[key].length > Object.keys(settings.coupon.available_to).length)    {
                                res.send({ status: 'failure', message: 'Invalid available_to field value'})
                                return
                            }    
                            c[key] = coupon[key]             
                            break
                        case 'send_media':
                            if(coupon[key].length > Object.keys(settings.coupon.send_media).length)    {
                                res.send({ status: 'failure', message: 'Invalid send_media field value'})
                                return
                            }
                            c[key] = coupon[key]
                            break
                        default:
                            c[key] = coupon[key]
                    }
                })
                c.save()
                res.send(c)
            }
        }).catch(next)
    })

    router.delete('/settings/coupons/:id', async (req, res, next) => {
        let id = req.params.id
        Coupon.destroy({ where: { id }}).then(c => {
            res.send({ status: 'success', message: 'Coupon Deleted'})
        }).catch(next)
    })

    router.get('/settings/coupons/:id', async (req, res, next) => {
        let id = req.params.id
        Coupon.findOne({ where : { id }}).then(c => {
            res.send(c)
        }).catch(next)   
    })  

    router.post('/system', (req, res) => {
        console.log(req.files)
    })

    return router;
}