module.exports = (app) => {
  var pasta = app.controller.pasta
  var auth = app.get("auth")

  var versao = "/v1"

  app.get("/:nomePasta",auth.authenticate("digest",{session:false}),pasta.listar)
  app.post(versao + "/pastas",auth.authenticate("digest",{session:false}),pasta.criar)
  app.get(versao + "/pastas/:nomePasta",auth.authenticate("digest",{session:false}),pasta.estatistica)
  app.put(versao + "/pastas/:nomePastaAtual",auth.authenticate("digest",{session:false}),pasta.editar)
  app.delete(versao + "/pastas/:nomePasta",auth.authenticate("digest",{session:false}),pasta.remover)

}
