module.exports = (app) => {
   var object = app.controller.object
   var auth = app.get("auth")

   var version = "/v1"

   app.post(version + "/folders/:nameFolder/object",auth.authenticate('bearer',{session:false}),object.saveFolder)
   app.post(version + "/folders/:nameFolder/subfolders/:nameSubFolder/object",auth.authenticate('bearer',{session:false}),object.saveSubFolder)
   app.get(version + "/folders/:nameFolder/object/:nameObject",auth.authenticate(['digest','bearer'],{session:false}),object.listFolder)
   app.get(version + "/folders/:nameFolder/subfolders/:nameSubFolder/object/:nameObject",auth.authenticate(['digest','bearer'],{session:false}),object.listSubFolder)
   app.delete(version + "/folders/:nameFolder/object/:nameObject",auth.authenticate('bearer',{session:false}),object.deleteFolder)
   app.delete(version + "/folders/:nameFolder/subfolders/:nameSubFolder/object/:nameObject",auth.authenticate('bearer',{session:false}),object.deleteSubFolder)   
}
