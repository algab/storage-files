module.exports = (app) => {
   var object = app.controller.object
   var auth = app.get("auth")

   var versao = "/v1"

   app.post(versao + "/folders/:nameFolder/object",auth.authenticate('bearer',{session:false}),object.saveFolder)
   app.post(versao + "/folders/:nameFolder/sonfolder/:nameSonFolder/object",auth.authenticate('bearer',{session:false}),object.saveSonFolder)
   app.get(versao + "/folders/:nameFolder/object/:nameObject",auth.authenticate(['digest','bearer'],{session:false}),object.listFolder)
   app.get(versao + "/folders/:nameFolder/subfolder/:nameSonFolder/object/:nameObject",auth.authenticate(['digest','bearer'],{session:false}),object.listSonFolder)
   app.delete(versao + "/folders/:nameFolder/object/:nameObject",auth.authenticate('bearer',{session:false}),object.deleteFolder)
   app.delete(versao + "/folders/:nameFolder/sonfolder/:nameSonFolder/object/:nameObject",auth.authenticate('bearer',{session:false}),object.deleteSonFolder)   
}
