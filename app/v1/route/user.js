module.exports = (app) => {
  var user = app.controller.user
  var auth = app.get("auth")
  var middleware = app.get("middleware")

  var version = "/v1"

  app.post(version + "/users",user.save)
  app.get(version + "/users",auth.authenticate('admin',{session:false}),user.list)
  app.get(version + "/users/:id",auth.authenticate('bearer',{session:false}),middleware.user,user.search)
  app.get(version + "/users/:id/folders",auth.authenticate('bearer',{session:false}),middleware.user,user.folder)
  app.put(version + "/users/:id",auth.authenticate('bearer',{session:false}),middleware.user,user.edit)
  app.delete(version + "/users/:id",auth.authenticate('bearer',{session:false}),middleware.user,user.delete)
}
