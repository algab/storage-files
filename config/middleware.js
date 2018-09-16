const auth = require("./auth")
const db = require("./database")
const util = require("util")

const middleware = {}

var all = util.promisify(db.all).bind(db)

middleware.app = async (req, res, next) => {
    let token = req.headers.authorization.slice(7)
    if (req.params.nameFolder) {
        let nameFolder = req.params.nameFolder
        try {
            let result = await all("SELECT id FROM users WHERE token = ?", [token])
            let folder = await all("SELECT nameFolder FROM folders WHERE idUser = ?", [result[0].id])
            if (folder[0].nameFolder == nameFolder) {
                next()
            }
            else {
                res.status(401).send('Unauthorized').end()
            }
        } catch (error) {
            res.status(401).send('Unauthorized').end()
        }
    }
    else if (req.params.nameFolderCurrent) {
        let nameFolder = req.params.nameFolderCurrent
        try {
            let result = await all("SELECT id FROM users WHERE token = ?", [token])
            let folder = await all("SELECT nameFolder FROM folders WHERE idUser = ?", [result[0].id])
            if (folder[0].nameFolder == nameFolder) {
                next()
            }
            else {
                res.status(401).send('Unauthorized').end()
            }
        } catch (error) {
            res.status(401).send('Unauthorized').end()
        }
    }    
    else {        
        let nameFolder = req.body.nameFolder               
        try {
            let result = await all("SELECT id FROM users WHERE token = ?", [token])
            let folder = await all("SELECT nameFolder FROM folders WHERE idUser = ?", [result[0].id])
            if (folder[0].nameFolder == nameFolder) {
                next()
            }
            else {
                res.status(401).send('Unauthorized').end()
            }
        } catch (error) {
            res.status(401).send('Unauthorized').end()
        }
    }
}

middleware.user = async (req, res, next) => {
    let id = req.params.id
    let token = req.headers.authorization.slice(7)
    try {
        let result = await all("SELECT token FROM users WHERE id = ?", [id])
        if (result[0].token == token) {
            next()
        }
        else {
            res.status(401).send('Unauthorized').end()
        }
    } catch (error) {
        res.status(401).send('Unauthorized').end()
    }
}

module.exports = middleware