module.exports = (app) => {
    var joi = app.get("joi")

    const folder = {
        nameFolder: joi.string().regex(/^[a-z]+$/).required(),
        nick: joi.string().required()
    }

    return folder
}
