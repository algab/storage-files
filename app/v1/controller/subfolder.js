module.exports = (app) => {
  var model = app.model.subfolder
  var joi = app.get("joi")
  var fs = app.get("fs")

  var subfolder = {}

  subfolder.create = (req, res) => {
    let data = req.body
    let result = joi.validate(data, model)
    if (result.error) {
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
            "urlFolder": `${process.env.protocol}://${req.headers.host}/${data.nameFolder}/${data.nameSubFolder}`
          }
          res.status(201).json(message)
        }
      })
    }
  }

  subfolder.stats = (req, res) => {
    let nameFolder = req.params.nameFolder
    let nameSubFolder = req.params.nameSubFolder
    fs.stat("./data/" + nameFolder + "/" + nameSubFolder, (err, data) => {
      if (err) {
        res.status(404).json({ "Message": "Verify that the Folder name and SubFolder is correct" })
      }
      else {
        let size = sizeSubFolder(nameFolder,nameSubFolder)
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
          "size": app.get("pretty")(size)
        }
        res.status(200).json(doc)
      }
    })
  }

  subfolder.edit = (req, res) => {
    let data = req.body
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
            "urlFolder": `${process.env.protocol}://${req.headers.host}/${data.nameFolder}/${data.nameSubFolder}`
          }
          res.status(200).json(message)
        }
      })
    }
  }

  subfolder.delete = (req, res) => {
    let nameFolder = req.params.nameFolder
    let nameSubFolder = req.params.nameSubFolder
    fs.rmdir("./data/" + nameFolder + "/" + nameSubFolder, (err) => {
      if (err) {
        if (err.errno == -17 || err.errno == -39) {
          res.status(409).json({ "Message": "SubFolder is not empty" })
        }
        if (err.errno == -2) {
          res.status(404).json({ "Message": "Folder not found" })
        }
      }
      else {
        res.status(200).json({ "Message": "SubFolder removed successful" })
      }
    })
  } 

  function generateDate(time) {
    let date = new Date(time)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  function generateTime(time) {
    let hour = new Date(time)
    return `${hour.getHours()}:${hour.getMinutes()}:${hour.getSeconds()}`
  }

  function sizeSubFolder(nameFolder,nameSubFolder) {
    let size = 0
    let data = fs.readdirSync(`./data/${nameFolder}/${nameSubFolder}`)
    for (let i = 0; i < data.length; i++) {
      size += fs.statSync(`./data/${nameFolder}/${nameSubFolder}/${data[i]}`).size
    }
    return size  
  }

  return subfolder
}
