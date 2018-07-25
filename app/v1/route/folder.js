module.exports = (app) => {
  var folder = app.controller.folder
  var auth = app.get("auth")

  var versao = "/v1"

  app.get("/:nameFolder",auth.authenticate(['digest','bearer'],{session:false}),folder.list)
  app.post(versao + "/folders",auth.authenticate('bearer',{session:false}),folder.create)
  app.get(versao + "/folders/:nameFolder/sonfolder",auth.authenticate(['digest','bearer'],{session:false}),folder.listFolderSon)
  app.get(versao + "/folders/:nameFolder",auth.authenticate(['digest','bearer'],{session:false}),folder.stats)
  app.put(versao + "/folders/:nameFolderCurrent",auth.authenticate('bearer',{session:false}),folder.edit)
  app.delete(versao + "/folders/:nameFolder",auth.authenticate('bearer',{session:false}),folder.delete)
}
