const joi = require('joi');

const bucket = {
    name: joi.string().regex(/^[a-z,0-9]+$/).min(4).required(),
    user_nick: joi.string().regex(/^[a-z,0-9]+$/).min(4).required(),
    private: joi.boolean().required(),
};

module.exports = bucket;
