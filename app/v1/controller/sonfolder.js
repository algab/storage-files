module.exports = (app) => {
  var model = app.model.sonfolder
  var joi = app.get("joi")
  var util = app.get("util")
  var fs = app.get("fs")
  var db = app.get("database")

  var sonfolder = {}

  var version = "/v1"

  var all = util.promisify(db.all).bind(db)

  sonfolder.create = async (req, res) => {
    let data = req.body
    let auth = await authBearer(req.headers.authorization.slice(7),data.nameFolder)
    if (auth == true) {
      let result = joi.validate(data, model)
      if (result.error != null) {
        res.status(400).json(result.error)
      }
      else {
        fs.mkdir("./data/" + data.nameFolder + "/" + data.nameSonFolder, (err) => {
          if (err) {
            if (err.errno == -17) {
              res.status(409).json({ "Message": "In that particular folder there is already a son folder with the same name" })
            }
            if (err.errno == -2) {
              res.status(404).json({ "Message": "Folder not found" })
            }
          }
          else {
            let message = {
              "Message": "SonFolder create successful",
              "urlFolder": `http://${req.headers.host}/${data.nameFolder}/${data.nameSonFolder}`
            }
            res.status(201).json(message)
          }
        })
      }
    }
    else {
      res.status(401).send("Unauthorized")
    }
  }

  sonfolder.stats = async (req, res) => {
    let nameFolder = req.params.nameFolder
    let auth = false
    if (req.user==true) {
      auth = await authBearer(req.headers.authorization.slice(7),nameFolder)
    } 
    else {
      auth = await authDigest(req.user, nameFolder)
    }   
    if (auth == true) {
      let nameSonFolder = req.params.nameSonFolder
      fs.stat("./data/" + nameFolder + "/" + nameSonFolder, (err, data) => {
        if (err) {
          res.status(404).json({ "Message": "Verify that the folder and son folder name is correct" })
        }
        else {
          doc = {
            "Created": {
              "Date": generateDate(data.birthtime),
              "Time": genereateTime(data.birthtime)
            },
            "Access": {
              "Date": generateDate(data.atime),
              "Time": genereateTime(data.atime)
            },
            "Modified": {
              "Date": generateDate(data.mtime),
              "Time": genereateTime(data.mtime)
            }
          }
          res.status(200).json(doc)
        }
      })
    }
    else {
      res.status(401).send("Unauthorized")
    }
  }

  sonfolder.edit = async (req, res) => {
    let data = req.body
    let auth = await authBearer(req.headers.authorization.slice(7),data.nameFolder)
    if (auth == true) {
      let nameSonFolderCurrent = req.params.nameSonFolderCurrent
      let result = joi.validate(data, model)
      if (result.error != null) {
        res.status(400).json(result.error)
      }
      else {
        fs.rename("./data/" + data.nameFolder + "/" + nameSonFolderCurrent, "./data/" + data.nameFolder + "/" + data.nameSonFolder, (err) => {
          if (err) {
            if (err.errno == -17) {
              res.status(409).json({ "Message": "In that particular folder there is already a son folder with the same name" })
            }
            if (err.errno == -2) {
              res.status(404).json({ "Message": "Folder not found" })
            }            
          }
          else {
            let message = {
              "Message": "SonFolder rename successful",
              "urlFolder": `http://${req.headers.host}/${data.nameFolder}/${data.nameSonFolder}`
            }
            res.status(200).json(message)
          }
        })
      }
    }
    else {
      res.status(401).send("Unauthorized")
    }
  }

  sonfolder.delete = async (req, res) => {
    let nameFolder = req.params.nameFolder
    let auth = await authBearer(req.headers.authorization.slice(7),nameFolder)
    if (auth == true) {
      let nameSonFolder = req.params.nameSonFolder
      fs.rmdir("./data/" + nameFolder + "/" + nameSonFolder, (err) => {
        if (err) {
          if (err.errno == -17) {
            res.status(409).json({ "Message": "Son Folder is not empty" })
          }
          if (err.errno == -2) {
            res.status(404).json({ "Message": "Folder not found" })
          }    
        }
        else {
          res.status(200).json({ "Message": "Son Folder removed successful" })
        }
      })
    }
    else {
      res.status(401).send("Unauthorized")
    }
  }

  async function authDigest(user, nameFolder) {
    try {
      let result = await all("SELECT id FROM users WHERE nick = ?", [user])
      let folder = await all("SELECT nameFolder FROM folders WHERE idUser = ?", [result[0].id])
      if (folder[0].nameFolder == nameFolder) {
        return true
      }
      else {
        return false
      }
    } catch (error) {
      return false
    }
  }

  async function authBearer(token, nameFolder) {
    try {
      let result = await all("SELECT id FROM users WHERE token = ?", [token])
      let folder = await all("SELECT nameFolder FROM folders WHERE idUser = ?", [result[0].id])
      if (folder[0].nameFolder == nameFolder) {
        return true
      }
      else {
        return false
      }
    } catch (error) {
      return false
    }
  }

  function generateDate(time) {
    let data = new Date(time)
    return `${data.getDate()}/${data.getMonth()}/${data.getFullYear()}`
  }

  function genereateTime(time) {
    let hora = new Date(time)
    return `${hora.getHours()}:${hora.getMinutes()}:${hora.getSeconds()}`
  }

  return sonfolder
}
