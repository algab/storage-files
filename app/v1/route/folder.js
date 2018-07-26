module.exports = (app) => {
  var folder = app.controller.folder
  var auth = app.get("auth")

  var version = "/v1"

  app.get("/:nameFolder",auth.authenticate(['digest','bearer'],{session:false}),folder.list)
  app.post(version + "/folders",auth.authenticate('bearer',{session:false}),folder.create)
  app.get(version + "/folders/:nameFolder/subfolders",auth.authenticate(['digest','bearer'],{session:false}),folder.listSubFolder)
  app.get(version + "/folders/:nameFolder",auth.authenticate(['digest','bearer'],{session:false}),folder.stats)
  app.put(version + "/folders/:nameFolderCurrent",auth.authenticate('bearer',{session:false}),folder.edit)
  app.delete(version + "/folders/:nameFolder",auth.authenticate('bearer',{session:false}),folder.delete)
}
