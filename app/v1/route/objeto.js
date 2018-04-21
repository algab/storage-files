module.exports = (app) => {
   var objeto = app.controller.objeto
   var auth = app.get("auth")

   var versao = "/v1"

   app.post(versao + "/pastas/:nomePasta/objeto",objeto.salvarPasta)
   app.post(versao + "/pastas/:nomePasta/subpastas/:nomeSubPasta/objeto",objeto.salvarSubPasta)
   app.get(versao + "/pastas/:nomePasta/objeto/:nomeObjeto",auth.authenticate("digest",{session:false}),objeto.listarPasta)
   app.get(versao + "/pastas/:nomePasta/subpastas/:nomeSubPasta/objeto/:nomeObjeto",auth.authenticate("digest",{session:false}),objeto.listarSubPasta)
   app.delete(versao + "/pastas/:nomePasta/objeto/:nomeObjeto",auth.authenticate("digest",{session:false}),objeto.removerPasta)
   app.delete(versao + "/pastas/:nomePasta/subpastas/:nomeSubPasta/objeto/:nomeObjeto",auth.authenticate("digest",{session:false}),objeto.removerSubPasta)
   
}
