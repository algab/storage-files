"use strict";

const joi = require("joi");

const user = {
    nick: joi.string().regex(/^[a-z,0-9]+$/).min(4).max(10).required(),
    name: joi.string().required(),
    country: joi.string().required(),
    state: joi.string().max(2).required(),
    city: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).max(20)
}

module.exports = user;