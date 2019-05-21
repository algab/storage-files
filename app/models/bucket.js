const joi = require("joi")

module.exports = () => {
    return {
        name: joi.string().regex(/^[a-z,0-9]+$/).required(),
        nick: joi.string().regex(/^[a-z,0-9]+$/).required()
    }
}
