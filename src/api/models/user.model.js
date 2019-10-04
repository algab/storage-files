const joi = require('joi');

const user = {
    nick: joi.string().regex(/^[a-z,0-9]+$/).min(4).required(),
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).max(20),
};

module.exports = user;
