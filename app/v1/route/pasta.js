module.exports = (app) => {
  var pasta = app.controller.pasta
  var auth = app.get("auth")

  var versao = "/v1"

  app.get("/:nomePasta",auth.authenticate(['digest','bearer'],{session:false}),pasta.listar)
  app.post(versao + "/pastas",auth.authenticate('bearer',{session:false}),pasta.criar)
  app.get(versao + "/pastas/:nomePasta/subpastas",auth.authenticate(['digest','bearer'],{session:false}),pasta.listarSubpasta)
  app.get(versao + "/pastas/:nomePasta",auth.authenticate(['digest','bearer'],{session:false}),pasta.estatistica)
  app.put(versao + "/pastas/:nomePastaAtual",auth.authenticate('bearer',{session:false}),pasta.editar)
  app.delete(versao + "/pastas/:nomePasta",auth.authenticate('bearer',{session:false}),pasta.remover)
}
