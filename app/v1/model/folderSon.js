module.exports = (app) => {
    var joi = app.get("joi")

    const folderSon = {
        nameFolder: joi.string().regex(/^[a-z]+$/).required(),
        nameFolderSon: joi.string().regex(/^[a-z]+$/).required()
    }

    return folderSon
}
