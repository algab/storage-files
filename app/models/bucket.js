const joi = require("joi")

module.exports = () => {
    return {
        name: joi.string().regex(/^[a-z,0-9]+$/).min(4).required(),
        nick: joi.string().regex(/^[a-z,0-9]+$/).min(4).max(10).required()
    }
}
