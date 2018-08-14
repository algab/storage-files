module.exports = (app) => {
    var joi = app.get("joi")

    const subfolder = {
        nameFolder: joi.string().regex(/^[a-z,0-9]+$/).required(),
        nameSubFolder: joi.string().regex(/^[a-z,0-9]+$/).required()
    }

    return subfolder
}
