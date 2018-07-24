module.exports = (app) => {
  var model = app.model.folder
  var joi = app.get("joi")
  var util = app.get("util")
  var fs = app.get("fs")
  var db = app.get("database")

  var folder = {}

  var version = "/v1"

  var run = util.promisify(db.run).bind(db)

  var all = util.promisify(db.all).bind(db)

  folder.create = async (req, res) => {
    let data = req.body
    let result = joi.validate(data, model)
    if (result.error) {
      res.status(400).json(result.error).end()
    }
    else {
      let usuario = await all("SELECT * FROM users WHERE nick = ?", [data.nick])
      if (usuario.length == 0) {
        res.status(404).json({ "Message": "User not found" }).end()
      }
      else {
        try {
          let userFolder = await all("SELECT id FROM folders WHERE idUsuario = ?", [user.id])
          if (userFolder.length > 0) {
            res.status(409).json({ "Message": "User already exists a folder" }).end()
          }
          else {
            fs.mkdir("./data/" + data.nameFolder, async (err) => {
              if (err) {
                res.status(409).json({ "Message": "Folder already exists" }).end()
              }
              else {
                db.run("INSERT INTO folders (nameFolder,idUser) VALUES (?,?)", [data.nameFolder, user.id], (err,result) => {
                  let message = {
                    "Message": "Folder create successful",
                    "urlFolder": `http://${req.headers.host}/${data.nameFolder}`
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
    let auth = false
    if (req.user==true) {
      auth = await authBearer(req.headers.authorization.slice(7),nameFolder)
    } 
    else {
      auth = await authDigest(req.user, nameFolder)
    }   
    if (auth == true) {
      fs.readdir("./data/" + nameFolder, (err, data) => {
        if (err) {
          res.status(404).json({ "Message": "Folder not found" }).end()
        }
        else {
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              if (data[i].search(new RegExp("[.]")) == -1) {
                data[i] = {"id":i,"name":data[i],"type":"folder"}
              }
              else {
                data[i] = {"id":i,"name":data[i],"type":"object"}
              }                  
            }
          }
          res.status(200).json(data).end()
        }
      })
    }
    else {
      res.status(401).send("Unauthorized").end()
    }
  }

  folder.listFolderSon = async (req,res) => {
    let nameFolder = req.params.nameFolder
    let auth = false
    if (req.user==true) {
      auth = await authBearer(req.headers.authorization.slice(7),nameFolder)
    } 
    else {
      auth = await authDigest(req.user, nameFolder)
    }   
    if (auth==true) {
      fs.readdir("./data/" + nameFolder, (err, data) => {
        if (err) {
          res.status(404).json({ "Message": "Folder not found" }).end()
        }
        else {
          let folderSon = []
          for(let i=0;i<data.length;i++) {
            if (data[i].search(new RegExp("[.]")) == -1) {
              let stats = fs.statSync(`./data/${nomeFolder}/${data[i]}`)            
              doc = {'name': data[i],'data': stats}
              folderSon.push(doc)              
            }
          }
          res.status(200).json(folderSon).end()
        }
      })
    } 
    else {
      res.status(401).send("Unauthorized").end()
    }
  }

  folder.stats = async (req, res) => {
    let nameFolder = req.params.nameFolder
    let auth = false
    if (req.user==true) {
      auth = await authBearer(req.headers.authorization.slice(7),nameFolder)
    } 
    else {
      auth = await authDigest(req.user, nameFolder)
    }   
    if (auth == true) {
      fs.stat("./data/" + nameFolder, (err, data) => {
        if (err) {
          res.status(404).json({ "Message": "Folder not found" }).end()
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

  folder.edit = async (req, res) => {
    let nameFolderCurrent = req.params.nameFolderCurrent
    let auth = await authBearer(req.headers.authorization.slice(7), nameFolderCurrent)
    if (auth == true) {
      let data = req.body
      let result = joi.validate(data, model)
      if (result.error) {
        res.status(400).json(result.error)
      }
      else {
        let usuario = await all("SELECT * FROM users WHERE nick = ?", [data.idUser])
        if (usuario.length == 0) {
          res.status(404).json({ "Message": "User not found" }).end()
        }
        else {
          fs.rename("./data/" + nameFolderCurrent, "./data/" + data.nameFolder, async (err) => {
            if (err) {
              res.status(409).json({ "Message": "Folder already exists" })
            }
            else {
              db.run("UPDATE folders SET nomePasta = ? WHERE idUser = ?", [data.nomePasta, data.idUsuario], (err,result) => {
                let message = {"Message":"Folder rename successful","urlFolder":`http://${req.headers.host}/${data.nomePasta}`}
                res.status(200).json(message)
              })
            }
          })
        }
      }
    }
    else {
      res.status(401).send("Unauthorized")
    }
  }

  folder.delete = async (req, res) => {
    let nameFolder = req.params.nameFolder
    let auth = await authBearer(req.headers.authorization.slice(7),nameFolder)
    if (auth == true) {
      fs.rmdir("./data/" + nameFolder, async (err) => {
        if (err) {
          if (err.errno == -2) {
            res.status(404).json({ "Message": "Folder not found" })
          }
          if (err.errno == -39) {
            res.status(409).json({ "Message": "Folder is not empty" })
          }
        }
        else {
          let email = await all("SELECT id FROM users WHERE email = ?", [req.user])
          let idFolder = await all("SELECT id FROM folders WHERE idUser = ?", [email[0].id])
          db.run("DELETE FROM folders WHERE id = ?", [idFolder[0].id],(err,result) => {
            if (err) {
              res.status(500).json({'Message':'Server Error'})
            }
            else {
              res.status(200).json({ "Mensagem": "Pasta excluida com sucesso" })
            }
          })
        }
      })
    }
    else {
      res.status(401).send("Unauthorized")
    }
  }

  async function authDigest(user, nomePasta) {
    try {
      let result = await all("SELECT id FROM users WHERE nick = ?", [user])
      let folder = await all("SELECT nameFolder FROM folders WHERE idUser = ?", [result[0].id])
      if (folder[0].nomePasta == nomePasta) {
        return true
      }
      else {
        return false
      }
    } catch (error) {
      return false
    }
  }

  async function authBearer(token, nomePasta) {
    try {
      let result = await all("SELECT id FROM users WHERE token = ?", [token])
      let folder = await all("SELECT nameFolder FROM folders WHERE idUser = ?", [result[0].id])
      if (folder[0].nomePasta == nomePasta) {
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

  function generateTime(time) {
    let hora = new Date(time)
    return `${hora.getHours()}:${hora.getMinutes()}:${hora.getSeconds()}`
  }


  return folder
}
