const joi = require("joi")

module.exports = (app) => {
    let subfolder = {}

    subfolder = {
        nameFolder: joi.string().regex(/^[a-z,0-9]+$/).required(),
        nameSubFolder: joi.string().regex(/^[a-z,0-9]+$/).required()
    }

    return subfolder
}
