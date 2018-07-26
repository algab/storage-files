module.exports = (app) => {
  var model = app.model.subfolder
  var joi = app.get("joi")
  var util = app.get("util")
  var fs = app.get("fs")
  var db = app.get("database")

  var subfolder = {}

  var version = "/v1"

  var all = util.promisify(db.all).bind(db)

  subfolder.create = async (req, res) => {
    let data = req.body
    let auth = await authBearer(req.headers.authorization.slice(7),data.nameFolder)
    if (auth == true) {
      let result = joi.validate(data, model)
      if (result.error != null) {
        res.status(400).json(result.error)
      }
      else {
        fs.mkdir("./data/" + data.nameFolder + "/" + data.nameSubFolder, (err) => {
          if (err) {
            if (err.errno == -17) {
              res.status(409).json({ "Message": "SubFolder with the same name already exists" })
            }
            if (err.errno == -2) {
              res.status(404).json({ "Message": "Folder not found" })
            }
          }
          else {
            let message = {
              "Message": "SubFolder create successful",
              "urlFolder": `http://${req.headers.host}/${data.nameFolder}/${data.nameSubFolder}`
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

  subfolder.stats = async (req, res) => {
    let nameFolder = req.params.nameFolder
    let auth = false
    if (req.user==true) {
      auth = await authBearer(req.headers.authorization.slice(7),nameFolder)
    } 
    else {
      auth = await authDigest(req.user, nameFolder)
    }   
    if (auth == true) {
      let nameSubFolder = req.params.nameSubFolder
      fs.stat("./data/" + nameFolder + "/" + nameSubFolder, (err, data) => {
        if (err) {
          res.status(404).json({ "Message": "Verify that the Folder name and SubFolder is correct" })
        }
        else {
          doc = {
            "Created": {
              "Date": generateDate(data.birthtime),
              "Time": generateTime(data.birthtime)
            },
            "Access": {
              "Date": generateDate(data.atime),
              "Time": generateTime(data.atime)
            },
            "Modified": {
              "Date": generateDate(data.mtime),
              "Time": generateTime(data.mtime)
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

  subfolder.edit = async (req, res) => {
    let data = req.body
    let auth = await authBearer(req.headers.authorization.slice(7),data.nameFolder)
    if (auth == true) {
      let nameSubFolderCurrent = req.params.nameSubFolderCurrent
      let result = joi.validate(data, model)
      if (result.error != null) {
        res.status(400).json(result.error)
      }
      else {
        fs.rename("./data/" + data.nameFolder + "/" + nameSubFolderCurrent, "./data/" + data.nameFolder + "/" + data.nameSubFolder, (err) => {
          if (err) {
            if (err.errno == -17) {
              res.status(409).json({ "Message": "SubFolder with the same name already exists" })
            }
            if (err.errno == -2) {
              res.status(404).json({ "Message": "Folder not found" })
            }            
          }
          else {
            let message = {
              "Message": "SubFolder rename successful",
              "urlFolder": `http://${req.headers.host}/${data.nameFolder}/${data.nameSubFolder}`
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

  subfolder.delete = async (req, res) => {
    let nameFolder = req.params.nameFolder
    let auth = await authBearer(req.headers.authorization.slice(7),nameFolder)
    if (auth == true) {
      let nameSubFolder = req.params.nameSubFolder
      fs.rmdir("./data/" + nameFolder + "/" + nameSubFolder, (err) => {
        if (err) {
          if (err.errno == -17) {
            res.status(409).json({ "Message": "Sub Folder is not empty" })
          }
          if (err.errno == -2) {
            res.status(404).json({ "Message": "Folder not found" })
          }    
        }
        else {
          res.status(200).json({ "Message": "Sub Folder removed successful" })
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
    let date = new Date(time)
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
  }

  function generateTime(time) {
    let hour = new Date(time)
    return `${hour.getHours()}:${hour.getMinutes()}:${hour.getSeconds()}`
  }

  return subfolder
}
