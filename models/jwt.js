module.exports.USER_JWT = {
    role: { type: String },
    useruuid: { type: String },
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