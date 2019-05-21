const fs = require("fs")

module.exports = (app) => {
  var middleware = app.get("middleware")

  app.get("/:nameFolder/:param", middleware.folder, (req, res) => {
    let nameFolder = req.params.nameFolder
    let param = req.params.param
    if (res.locals.subfolder) {
      fs.readdir(`./data/${nameFolder}/${param}`, (err, data) => {
        if (err) {
          res.status(404).json({ "Message": "SubFolder not found" })
        }
        else {
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              data[i] = { "name": data[i], "type": "object" }
            }
          }
          res.status(200).json(data)
        }
      })
    }
    else {
      const object = fs.createReadStream(`./data/${nameFolder}/${param}`)

      object.on("error", (err) => {
        res.status(404).json({ "Message": "Object not found" })
      })

      object.pipe(res)
    }
  })

  app.get("/:nameFolder/:nameSubFolder/:object", (req, res) => {
    let nameFolder = req.params.nameFolder
    let nameSubFolder = req.params.nameSubFolder
    let obj = req.params.object

    const object = fs.createReadStream(`./data/${nameFolder}/${nameSubFolder}/${obj}`)

    object.on("error", (err) => {
      res.status(404).json({ "Message": "Object not found" })
    })

    object.pipe(res)
  })

}
