"use strict";

const joi = require("joi");

module.exports = () => {
    return {
        bucket: joi.string().regex(/^[a-z,0-9]+$/).required(),
        folder: joi.string().regex(/^[a-z,0-9]+$/).required()
    }
}