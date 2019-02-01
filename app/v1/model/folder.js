const joi = require("joi")

module.exports = (app) => {
    let folder = {}

    folder = {
        nameFolder: joi.string().regex(/^[a-z,0-9]+$/).required(),
        nick: joi.string().regex(/^[a-z,0-9]+$/).required()
    }

    return folder
}
