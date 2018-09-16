module.exports = (app) => {
  var model = app.model.folder
  var joi = app.get("joi")
  var util = app.get("util")
  var fs = app.get("fs")
  var db = app.get("database")

  var folder = {}

  var version = "/v1"

  var all = util.promisify(db.all).bind(db)

  var size = util.promisify(app.get("sizeFolder"))

  folder.create = async (req, res) => {
    let data = req.body
    let result = joi.validate(data, model)
    if (result.error) {
      res.status(400).json(result.error).end()
    }
    else {
      let user = await all("SELECT * FROM users WHERE nick = ?", [data.nick])
      if (user.length == 0) {
        res.status(404).json({ "Message": "User not found" }).end()
      }
      else {
        try {
          let userFolder = await all("SELECT id FROM folders WHERE idUser = ?", [user[0].id])
          if (userFolder.length > 0) {
            res.status(409).json({ "Message": "User already exists a folder" }).end()
          }
          else {
            fs.mkdir("./data/" + data.nameFolder, async (err) => {
              if (err) {
                res.status(409).json({ "Message": "Folder already exists" }).end()
              }
              else {
                db.run("INSERT INTO folders (nameFolder,idUser) VALUES (?,?)", [data.nameFolder, user[0].id], (err, result) => {
                  let message = {
                    "Message": "Folder create successful",
                    "urlFolder": `${process.env.protocol}://${req.headers.host}/${data.nameFolder}`
                  }
                  res.status(201).json(message).end()
                })
              }
            })
          }
        } catch (error) {
          res.status(500).json({ "Message": "Server Error" })
        }
      }
    }
  }

  folder.list = async (req, res) => {
    let nameFolder = req.params.nameFolder
    let type = req.query.type
    fs.readdir("./data/" + nameFolder, (err, data) => {
      if (err) {
        res.status(404).json({ "Message": "Folder not found" }).end()
      }
      else {
        if (data.length > 0) {
          if (type) {
            if (type == "folder") {
              folder = []
              for (let i = 0; i < data.length; i++) {
                if (data[i].search(new RegExp("[.]")) == -1) {
                  folder.push({ "id": i, "name": data[i], "type": "folder" })
                }
              }
              res.status(200).json(folder).end()
            }
            else if (type == "object") {
              object = []
              for (let i = 0; i < data.length; i++) {
                if (data[i].search(new RegExp("[.]")) != -1) {
                  object.push({ "id": i, "name": data[i], "type": "object" })
                }
              }
              res.status(200).json(object).end()
            }
            else {
              res.status(200).json([]).end()
            }
          }
          else {
            for (let i = 0; i < data.length; i++) {
              if (data[i].search(new RegExp("[.]")) == -1) {
                data[i] = { "id": i, "name": data[i], "type": "folder" }
              }
              else {
                data[i] = { "id": i, "name": data[i], "type": "object" }
              }
            }
            res.status(200).json(data).end()
          }
        }
        else {
          res.status(200).json(data).end()
        }
      }
    })
  }

  folder.stats = async (req, res) => {
    let nameFolder = req.params.nameFolder
    fs.stat("./data/" + nameFolder, async (err, data) => {
      if (err) {
        res.status(404).json({ "Message": "Folder not found" }).end()
      }
      else {        
        let total = 0
        let dataFolder = fs.readdirSync(`./data/${nameFolder}`)
        let folders = dataFolder.filter(elem => elem.search(new RegExp("[.]")) == -1)
        for (let i = 0; i < folders.length; i++) {
          total += await size(`./data/${nameFolder}/${folders[0]}`)
        }
        app.get("sizeFolder")(`./data/${nameFolder}`, (err, size) => {
          if (err) {
            res.status(500).json({ "Message": "Server Error" }).end()
          }
          else {
            let doc = {
              "created": {
                "date": generateDate(data.atime),
                "time": generateTime(data.atime)
              },
              "access": {
                "date": generateDate(data.birthtime),
                "time": generateTime(data.birthtime)
              },
              "modified": {
                "date": generateDate(data.mtime),
                "time": generateTime(data.mtime)
              },
              "size": size + total
            }
            res.status(200).json(doc).end()
          }
        })
      }
    })
  }

  folder.edit = async (req, res) => {
    let data = req.body
    let nameFolderCurrent = req.params.nameFolderCurrent
    let result = joi.validate(data, model)
    if (result.error) {
      res.status(400).json(result.error).end()
    }
    else {
      let user = await all("SELECT id FROM users WHERE nick = ?", [data.nick])
      if (user.length == 0) {
        res.status(404).json({ "Message": "User not found" }).end()
      }
      else {
        fs.rename("./data/" + nameFolderCurrent, "./data/" + data.nameFolder, async (err) => {
          if (err) {
            res.status(409).json({ "Message": "Folder already exists" }).end()
          }
          else {
            db.run("UPDATE folders SET nameFolder = ? WHERE idUser = ?", [data.nameFolder, user[0].id], (err, result) => {
              let message = {
                "Message": "Folder rename successful",
                "urlFolder": `${process.env.protocol}://${req.headers.host}/${data.nameFolder}`
              }
              res.status(200).json(message).end()
            })
          }
        })
      }
    }
  }

  folder.delete = async (req, res) => {
    let nameFolder = req.params.nameFolder
    fs.rmdir("./data/" + nameFolder, async (err) => {
      if (err) {
        if (err.errno == -2) {
          res.status(404).json({ "Message": "Folder not found" })
        }
        if (err.errno == -17 || err.errno == -39) {
          res.status(409).json({ "Message": "Folder is not empty" })
        }
      }
      else {
        try {
          let idFolder = await all("SELECT id FROM folders WHERE nameFolder = ?", [nameFolder])
          db.run("DELETE FROM folders WHERE id = ?", [idFolder[0].id], (err, result) => {
            if (err) {
              res.status(500).json({ 'Message': 'Server Error' })
            }
            else {
              res.status(200).json({ "Message": "Folder removed successful" })
            }
          })
        } catch (error) {
          fs.mkdirSync(`./data/${nameFolder}`)
          res.status(500).json({ "Message": "Server Error" })
        }
      }
    })
  }

  function generateDate(time) {
    let date = new Date(time)
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
  }

  function generateTime(time) {
    let hour = new Date(time)
    return `${hour.getHours()}:${hour.getMinutes()}:${hour.getSeconds()}`
  }

  return folder
}
