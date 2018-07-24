module.exports = (app) => {
  var user = app.controller.user
  var auth = app.get("auth")

  var version = "/v1"

  app.post(version + "/users",user.save)
  app.get(version + "/users",auth.authenticate('admin',{session:false}),user.list)
  app.get(version + "/users/:id",auth.authenticate(['digest','bearer'],{session:false}),user.search)
  app.put(version + "/users/login",user.login)
  app.put(version + "/users/:id",auth.authenticate('bearer',{session:false}),user.edit)
  app.delete(version + "/users/:id",auth.authenticate('bearer',{session:false}),user.delete)
}
