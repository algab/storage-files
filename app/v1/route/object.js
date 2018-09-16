module.exports = (app) => {
   var object = app.controller.object
   var auth = app.get("auth")
   var middleware = app.get("middleware")

   var version = "/v1"

   app.post(version + "/folders/:nameFolder/object",auth.authenticate('bearer',{session:false}),middleware.app,object.saveFolder)
   app.post(version + "/folders/:nameFolder/subfolders/:nameSubFolder/object",auth.authenticate('bearer',{session:false}),middleware.app,object.saveSubFolder)
   app.get(version + "/folders/:nameFolder/object/:nameObject",auth.authenticate('bearer',{session:false}),middleware.app,object.listFolder)
   app.get(version + "/folders/:nameFolder/subfolders/:nameSubFolder/object/:nameObject",auth.authenticate('bearer',{session:false}),middleware.app,object.listSubFolder)
   app.delete(version + "/folders/:nameFolder/object/:nameObject",auth.authenticate('bearer',{session:false}),middleware.app,object.deleteFolder)
   app.delete(version + "/folders/:nameFolder/subfolders/:nameSubFolder/object/:nameObject",auth.authenticate('bearer',{session:false}),middleware.app,object.deleteSubFolder)   
}
