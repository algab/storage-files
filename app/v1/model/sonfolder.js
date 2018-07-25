module.exports = (app) => {
    var joi = app.get("joi")

    const sonfolder = {
        nameFolder: joi.string().regex(/^[a-z]+$/).required(),
        nameSonFolder: joi.string().regex(/^[a-z]+$/).required()
    }

    return sonfolder
}
