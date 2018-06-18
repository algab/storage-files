module.exports = (app) => {
  var subpasta = app.controller.subpasta
  var auth = app.get("auth")

  var versao = "/v1"

  app.post(versao + "/subpastas",auth.authenticate('bearer',{session:false}),subpasta.criar)
  app.get(versao + "/subpastas/:nomeSubPasta/pastas/:nomePasta",auth.authenticate('digest',{session:false}),subpasta.estatistica)
  app.put(versao + "/subpastas/:nomeSubPastaAtual",auth.authenticate('bearer',{session:false}),subpasta.editar)
  app.delete(versao + "/subpastas/:nomeSubPasta/pastas/:nomePasta",auth.authenticate('bearer',{session:false}),subpasta.remover)
}
