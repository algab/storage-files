module.exports = (app) => {
  var subfolder = app.controller.subfolder
  var auth = app.get("auth")
  var middleware = app.get("middleware")

  var version = "/v1"

  app.post(version + "/subfolders",auth.authenticate('bearer',{session:false}),middleware.app,subfolder.create)
  app.get(version + "/subfolders/:nameSubFolder/folders/:nameFolder",auth.authenticate('bearer',{session:false}),middleware.app,subfolder.stats)
  app.put(version + "/subfolders/:nameSubFolderCurrent",auth.authenticate('bearer',{session:false}),middleware.app,subfolder.edit)
  app.delete(version + "/subfolders/:nameSubFolder/folders/:nameFolder",auth.authenticate('bearer',{session:false}),middleware.app,subfolder.delete)
}
