module.exports = (app) => {
    var joi = app.get("joi")

    const pasta = {
        nomePasta: joi.string().regex(/^[a-z]+$/).required(),
        nick: joi.string().required()
    }

    return pasta
}
