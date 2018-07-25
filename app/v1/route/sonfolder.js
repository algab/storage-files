module.exports = (app) => {
  var sonfolder = app.controller.sonfolder
  var auth = app.get("auth")

  var versao = "/v1"

  app.post(versao + "/sonfolder",auth.authenticate('bearer',{session:false}),sonfolder.create)
  app.get(versao + "/sonfolder/:nameSonFolder/folders/:nameFolder",auth.authenticate(['digest','bearer'],{session:false}),sonfolder.stats)
  app.put(versao + "/sonfolder/:nameSonFolderCurrent",auth.authenticate('bearer',{session:false}),sonfolder.edit)
  app.delete(versao + "/sonfolder/:nameSonFolder/folders/:nameFolder",auth.authenticate('bearer',{session:false}),sonfolder.delete)
}
