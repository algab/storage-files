module.exports = (app) => {
  var fs = app.get("fs")
  var fsExtra = app.get("fs-extra")
  var formidable = app.get("formidable")

  var object = {}

  object.saveFolder = (req, res) => {
    let nameFolder = req.params.nameFolder
    if (nameFolder) {
      let folder = fs.existsSync("./data/" + nameFolder)
      if (folder == false) {
        res.status(404).json({ "Message": "Folder not found" })
      }
      else {
        let io = app.get("io")
        let token = req.headers.authorization.slice(7)
        let form = new formidable.IncomingForm()

        form.parse(req, (err, fields, files) => { })

        form.on("progress", (rec, exp) => {
          let total = (rec / exp) * 100
          io.emit(token, { "percent": parseInt(total) })
        })

        form.on('file', (name, file) => {
          let object = file.name
          let obj = fs.existsSync(`./data/${nameFolder}/${object}`)

          if (obj == true) {
            let objects = fs.readdirSync(`./data/${nameFolder}`)
            object = nameObject(objects, object)
          }

          let oldpath = file.path
          let newpath = `./data/${nameFolder}/${object}`

          fsExtra.move(oldpath, newpath, (err) => {
            if (err) {
              if (err.errno == -17) {
                res.status(409).json({ "Message": "File already exists" }).end()
              }
              else {
                res.status(500).json({ "Message": "Make sure the folder name is correct and try again" }).end()
              }
            }
            else {
              let message = {
                "Message": "Object save successful",
                "urlObject": `${process.env.protocol}://${req.headers.host}/${nameFolder}/${object}`
              }
              res.status(200).json(message).end()
            }
          })
        })
      }
    }
    else {
      res.status(400).json({ "Message": "Folder is required" })
    }
  }

  object.saveSubFolder = (req, res) => {
    let nameFolder = req.params.nameFolder
    let nameSubFolder = req.params.nameSubFolder
    if (nameFolder == null || nameSubFolder == null) {
      res.status(400).json({ "Mensagem": "Folder name and SubFolder is required" })
    }
    else {
      let folder = fs.existsSync("./data/" + nameFolder)
      let subFolder = fs.existsSync("./data/" + nameFolder + "/" + nameSubFolder)

      if (folder == false) {
        res.status(404).json({ "Message": "Folder not found" })
      }
      else if (subFolder == false) {
        res.status(404).json({ "Message": "SubFolder not found" })
      }
      else {
        let io = app.get("io")
        let token = req.headers.authorization.slice(7)
        let form = new formidable.IncomingForm()

        form.parse(req, (err, fields, files) => { })

        form.on("progress", (rec, exp) => {
          let total = (rec / exp) * 100
          io.emit(token, { "percent": parseInt(total) })
        })

        form.on('file', (name, file) => {
          let object = file.name
          let obj = fs.existsSync(`./data/${nameFolder}/${nameSubFolder}/${object}`)

          if (obj == true) {
            let objects = fs.readdirSync(`./data/${nameFolder}/${nameSubFolder}`)
            object = nameObject(objects, object)
          }

          let oldpath = file.path
          let newpath = `./data/${nameFolder}/${nameSubFolder}/${object}`

          fsExtra.move(oldpath, newpath, (err) => {
            if (err) {
              if (err.errno == -17) {
                res.status(409).json({ "Message": "File already exists" }).end()
              }
              else {
                res.status(500).json({ "Message": "Make sure the folder name is correct and try again" }).end()
              }
            }
            else {
              let message = {
                "Message": "Object save successful",
                "urlObject": `${process.env.protocol}://${req.headers.host}/${nameFolder}/${nameSubFolder}/${object}`
              }
              res.status(200).json(message).end()
            }
          })
        })
      }
    }
  }

  object.listFolder = (req, res) => {
    let nameFolder = req.params.nameFolder
    let nameObject = req.params.nameObject
    fs.stat("./data/" + nameFolder + "/" + nameObject, (err, data) => {
      if (err) {
        res.status(404).json({ "Message": "Make sure the Folder name and object is correct and try again" })
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
          "size": app.get("pretty")(data.size)
        }
        res.status(200).json(doc)
      }
    })
  }

  object.listSubFolder = (req, res) => {
    let nameFolder = req.params.nameFolder
    let nameSubFolder = req.params.nameSubFolder
    let nameObject = req.params.nameObject
    fs.stat("./data/" + nameFolder + "/" + nameSubFolder + "/" + nameObject, (err, stats) => {
      if (err) {
        res.status(404).json({ "Message": "Make sure the Folder name, SubFolder and Object is correct and try again" })
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
          "size": app.get("pretty")(data.size)
        }
        res.status(200).json(doc)
      }
    })
  }

  object.deleteFolder = (req, res) => {
    let nameFolder = req.params.nameFolder
    let nameObject = req.params.nameObject
    fs.unlink("./data/" + nameFolder + "/" + nameObject, (err) => {
      if (err) {
        res.status(404).json({ "Message": "Make sure the Folder name and Object is correct and try again" })
      }
      else {
        res.status(200).json({ "Message": "Object removed successful" })
      }
    })
  }

  object.deleteSubFolder = (req, res) => {
    let nameFolder = req.params.nameFolder
    let nameSubFolder = req.params.nameSubFolder
    let nameObject = req.params.nameObject
    fs.unlink("./data/" + nameFolder + "/" + nameSubFolder + "/" + nameObject, (err) => {
      if (err) {
        res.status(404).json({ "Message": "Make sure the Folder name, SubFolder and Object is correct and try again" })
      }
      else {
        res.status(200).json({ "Message": "Object removed successful" })
      }
    })
  }

  function nameObject(data, object) {
    let total = 0
    let split = object.split(".")   
    if (split.length == 2) {
      for (let i = 0; i < data.length; i++) {
        let hasObject = data[i].search(`${split[0]}-`)
        if (hasObject > -1) {
          total++
        }
      }
      return `${split[0]}-${total + 1}.${split[1]}`
    }
    else {
      let newSplit = object.split(".")
      let type = newSplit[newSplit.length - 1]

      newSplit.pop()
      newSplit = newSplit.join(".")

      let split = []
      split.push(newSplit)
      split.push(type)    

      for (let i = 0; i < data.length; i++) {
        let hasObject = data[i].search(`${split[0]}-`)
        if (hasObject > -1) {
          total++
        }
      }
      return `${split[0]}-${total + 1}.${split[1]}`
    }
  }

  function generateDate(time) {
    let date = new Date(time)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  function generateTime(time) {
    let hour = new Date(time)
    return `${hour.getHours()}:${hour.getMinutes()}:${hour.getSeconds()}`
  }

  return object
}