module.exports = (app) => {
  var subpasta = app.controller.subpasta
  var auth = app.get("auth")

  var versao = "/v1"

  app.get("/:nomePasta/:nomeSubPasta",subpasta.listar)
  app.post(versao + "/pastas/subpastas",auth.authenticate("digest",{session:false}),subpasta.criar)
  app.get(versao + "/pastas/:nomePasta/subpastas/:nomeSubPasta",auth.authenticate("digest",{session:false}),subpasta.estatistica)
  app.put(versao + "/pastas/subpastas/:nomeSubPastaAtual",auth.authenticate("digest",{session:false}),subpasta.editar)
  app.delete(versao + "/pastas/:nomePasta/subpastas/:nomeSubPasta",auth.authenticate("digest",{session:false}),subpasta.remover)
  
}
