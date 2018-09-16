module.exports = (app) => {
  var folder = app.controller.folder
  var auth = app.get("auth")
  var middleware = app.get("middleware")

  var version = "/v1"

  app.get("/:nameFolder",auth.authenticate('bearer',{session:false}),middleware.app,folder.list)
  
  app.post(version + "/folders",auth.authenticate('bearer',{session:false}),folder.create)
  app.get(version + "/folders/:nameFolder",auth.authenticate('bearer',{session:false}),middleware.app,folder.stats)
  app.put(version + "/folders/:nameFolderCurrent",auth.authenticate('bearer',{session:false}),middleware.app,folder.edit)
  app.delete(version + "/folders/:nameFolder",auth.authenticate('bearer',{session:false}),middleware.app,folder.delete)
}
