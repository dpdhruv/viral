

module.exports.USER_JWT = {
    role: { type: String },
    useruuid: { type: String },
    iat: { type: Number },
    exp: { type: Number }
}

module.exports.SIGNUP_REFERRAL_JWT = {
    role: { type: String },
    referrer: { type: String },
    referral_token: { type: String },
    iat: { type: Number },
    exp: { type: Number }
}

module.exports.VERIFY_NEW_USER_JWT = {
    role: { type: String },
    user: { type: String },
    iat: { type: Number },
    exp: { type: Number }
}

module.exports.VERIFY_REFERRAL_USER_JWT = {
    role: { type: String },
    user: { type: String },
    referrel: { 
        type: Object,

        referrer: { type: String },
        referral_token: { type: String }
    },
    iat: { type: Number },
    exp: { type: Number }
}

module.exports.PASSWORD_RESET_JWT = {
    role: { type: String },
    user: {
        type: Object,
        username: { type: String },
        phone_no: { type: String },
    },
    iat: { type: Number },
    exp: { type: Number }
}