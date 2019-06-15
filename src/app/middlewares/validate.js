const joi = require('joi');

const validate = model => (req, res, next) => {
    const result = joi.validate(req.body, model);
    if (result.error) {
        res.status(400).json(result.error).end();
    } else {
        next();
    }
};

module.exports = validate;
