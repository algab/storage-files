module.exports = (app) => {
  var fs = app.get("fs")

  app.get("/:nameFolder/:param", (req, res) => { 
    let nameFolder = req.params.nameFolder
    let param = req.params.param
    let result = param.search(new RegExp("[.]"))
    if (result == -1) {
      fs.readdir(`./data/${nameFolder}/${param}`, (err, data) => {
        if (err) {
          res.status(404).json({ "Message": "Son Folder not found" })
        }
        else {
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

  app.get("/:nameFolder/:nameSonFolder/:object", (req, res) => {
    let nameFolder = req.params.nameFolder
    let nameSonFolder = req.params.nameSonFolder
    let obj = req.params.object

    const object = fs.createReadStream(`./data/${nameFolder}/${nameSonFolder}/${obj}`)
    object.on("error", (err) => {
      res.status(404).json({ "Message": "Object not found" })
    })
    objeto.pipe(res)
  })
    
}
