module.exports = (app) => {
  var subfolder = app.controller.subfolder
  var auth = app.get("auth")

  var version = "/v1"

  app.post(version + "/subfolders",auth.authenticate('bearer',{session:false}),subfolder.create)
  app.get(version + "/subfolders/:nameSubFolder/folders/:nameFolder",auth.authenticate(['digest','bearer'],{session:false}),subfolder.stats)
  app.put(version + "/subfolders/:nameSubFolderCurrent",auth.authenticate('bearer',{session:false}),subfolder.edit)
  app.delete(version + "/subfolders/:nameSubFolder/folders/:nameFolder",auth.authenticate('bearer',{session:false}),subfolder.delete)
}
