const Op = require('sequelize').Op;
const User = require('../models/user');

module.exports.check_user_details = async (user) => {
    message = '';
    if(!isValidUsername(user.username))   {
        message += `Invalid Username\n`;
    }
    if(!isValidPassword(user.password)) {
        message += `Invalid Password\n`;
    }
    if(!isValidPhoneNumber(user.phone_no))  {
        message += 'Invalid phone number\n';
    }
    if(!isValidEmail(user.email))   {
        message += 'Invalid Email\n'
    }
    if(!isValidName(user.name)) {
        message += 'Invalid name\n';
    }
    if(message == '')   {
        message = await verify_duplication(user);
    }    
    return message == '' ? undefined : message;
}

async function verify_duplication(user)   {
    let message = '';
    const list = await User.findAll({ where: { [Op.or]:  [ {username: user.username}, {phone_no: user.phone_no} ]}});
    await new Promise((resolve) => {
        list.forEach((value, index) => {
            if(value.dataValues.username == user.username)  {
                message += "Username exists\n"
            }
            if(value.dataValues.phone_no == user.phone_no)  {
                message += "phone_no exists\n"
            }
            if(list.length-1 == index)  resolve();
        });
        resolve();
    });
    return message;
}

function isValidUsername(username)  {
    let pattern = /^[a-zA-Z_][a-z0-9_]{3,}$/
    let regexp = new RegExp(pattern);
    return regexp.test(username);
}

function isValidPassword(password)  {
    let pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{8,}$/
    let regexp = new RegExp(pattern);
    return regexp.test(password);
}

function isValidEmail(email)    {
    return true;
    let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    let regexp = new RegExp(pattern);
    return regexp.test(email);
}

function isValidPhoneNumber(phone_no)   {
    let pattern = /^[0-9]{10}$/
    let regexp = new RegExp(pattern);
    return regexp.test(phone_no);
}

function isValidName(name) {   
    let pattern = /^[A-Za-z]+$/
    let regexp = new RegExp(pattern);
    return regexp.test(name);
}


module.exports.isValidPassword = isValidPassword;