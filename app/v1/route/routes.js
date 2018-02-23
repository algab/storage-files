module.exports = (app) => {
   var pasta = app.controller.pasta
   var subpasta = app.controller.subpasta
   var objeto = app.controller.objeto
   var auth = app.get("auth")

   var versao = "/v1"

   // Pasta
   app.get("/:nomePasta",auth.authenticate("digest",{session:false}),pasta.listar)
   app.post(versao + "/pastas", pasta.criar)
   app.get(versao + "/pastas/:nomePasta",auth.authenticate("digest",{session:false}),pasta.estatistica)
   app.put(versao + "/pastas/:nomePastaAtual",auth.authenticate("digest",{session:false}),pasta.editar)
   app.delete(versao + "/pastas/:nomePasta",auth.authenticate("digest",{session:false}),pasta.remover)

   // SubPasta
   app.get("/:nomePasta/:nomeSubPasta",auth.authenticate("digest",{session:false}),subpasta.listar)
   app.post(versao + "/pastas/:nomePasta/subpasta",auth.authenticate("digest",{session:false}),subpasta.criar)
   app.get(versao + "/pastas/:nomePasta/subpasta/:nomeSubPasta",auth.authenticate("digest",{session:false}),subpasta.estatistica)
   app.put(versao + "/pastas/:nomePasta/subpasta/:nomeSubPastaAtual",auth.authenticate("digest",{session:false}),subpasta.editar)
   app.delete(versao + "/pastas/:nomePasta/subpasta/:nomeSubPasta",auth.authenticate("digest",{session:false}),subpasta.remover)

   //Objeto
   app.post(versao + "/pastas/:nomePasta/objeto",auth.authenticate("digest",{session:false}),objeto.salvarPasta)
   app.post(versao + "/pastas/:nomePasta/subpasta/:nomeSubPasta/objeto",auth.authenticate("digest",{session:false}),objeto.salvarSubPasta)
   app.get(versao + "/pastas/:nomePasta/objeto/:nomeObjeto",auth.authenticate("digest",{session:false}),objeto.listarPasta)
   app.get(versao + "/pastas/:nomePasta/subpasta/:nomeSubPasta/objeto/:nomeObjeto",auth.authenticate("digest",{session:false}),objeto.listarSubPasta)
   app.delete(versao + "/pastas/:nomePasta/objeto/:nomeObjeto",auth.authenticate("digest",{session:false}),objeto.removerPasta)
   app.delete(versao + "/pastas/:nomePasta/subpasta/:nomeSubPasta/objeto/:nomeObjeto",auth.authenticate("digest",{session:false}),objeto.removerSubPasta)
}
