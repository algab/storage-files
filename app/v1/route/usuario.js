module.exports = (app) => {
  var usuario = app.controller.usuario
  var auth = app.get("auth")

  var versao = "/v1"

  app.post(versao + "/usuarios",usuario.salvar)
  app.get(versao + "/usuarios/admin",auth.authenticate("admin",{session:false}),usuario.user)
  app.get(versao + "/usuarios/:id",auth.authenticate("digest",{session:false}),usuario.listarUser)
  app.put(versao + "/usuarios/login",usuario.login)
  app.put(versao + "/usuarios/:id",auth.authenticate("digest",{session:false}),usuario.editar)
  app.delete(versao + "/usuarios/:id",auth.authenticate("digest",{session:false}),usuario.deletar)

}
