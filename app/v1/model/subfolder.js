module.exports = (app) => {
    var joi = app.get("joi")

    const subfolder = {
        nameFolder: joi.string().regex(/^[a-z]+$/).required(),
        nameSubFolder: joi.string().regex(/^[a-z]+$/).required()
    }

    return subfolder
}
