"use strict";

const joi = require("joi");

module.exports = (model) => {
    return (req, res, next) => {
        const result = joi.validate(req.body, model);
        if (result.error) {
            res.status(400).json(result.error).end();
        } else {
            next();
        }
    }
}