module.exports = (app) => {
   var pasta = app.controller.pasta
   var subpasta = app.controller.subpasta
   var objeto = app.controller.objeto
   var usuario = app.controller.usuario
   var auth = app.get("auth")

   var versao = "/v1"

   // Pasta
   app.get("/:nomePasta",auth.authenticate("digest",{session:false}),pasta.listar)
   app.post(versao + "/pastas", pasta.criar)
   app.get(versao + "/pastas/:nomePasta",auth.authenticate("digest",{session:false}),pasta.estatistica)
   app.put(versao + "/pastas/:nomePastaAtual",auth.authenticate("digest",{session:false}),pasta.editar)
   app.delete(versao + "/pastas/:nomePasta",auth.authenticate("digest",{session:false}),pasta.remover)

   // SubPasta
   app.get("/:nomePasta/:nomeSubPasta",subpasta.listar)
   app.post(versao + "/pastas/subpastas",auth.authenticate("digest",{session:false}),subpasta.criar)
   app.get(versao + "/pastas/:nomePasta/subpastas/:nomeSubPasta",auth.authenticate("digest",{session:false}),subpasta.estatistica)
   app.put(versao + "/pastas/subpastas/:nomeSubPastaAtual",auth.authenticate("digest",{session:false}),subpasta.editar)
   app.delete(versao + "/pastas/:nomePasta/subpastas/:nomeSubPasta",auth.authenticate("digest",{session:false}),subpasta.remover)

   //Objeto
   app.post(versao + "/pastas/:nomePasta/objeto",objeto.salvarPasta)
   app.post(versao + "/pastas/:nomePasta/subpastas/:nomeSubPasta/objeto",objeto.salvarSubPasta)
   app.get(versao + "/pastas/:nomePasta/objeto/:nomeObjeto",auth.authenticate("digest",{session:false}),objeto.listarPasta)
   app.get(versao + "/pastas/:nomePasta/subpastas/:nomeSubPasta/objeto/:nomeObjeto",auth.authenticate("digest",{session:false}),objeto.listarSubPasta)
   app.delete(versao + "/pastas/:nomePasta/objeto/:nomeObjeto",auth.authenticate("digest",{session:false}),objeto.removerPasta)
   app.delete(versao + "/pastas/:nomePasta/subpastas/:nomeSubPasta/objeto/:nomeObjeto",auth.authenticate("digest",{session:false}),objeto.removerSubPasta)

   //Usuario
   app.post(versao + "/usuarios",usuario.salvar)
   app.get(versao + "/usuarios/:id",auth.authenticate("digest",{session:false}),usuario.listarUser)
   app.put(versao + "/usuarios/login",usuario.login)
   app.put(versao + "/usuarios/:id",auth.authenticate("digest",{session:false}),usuario.editar)
   app.delete(versao + "/usuarios/:id",auth.authenticate("digest",{session:false}),usuario.deletar)
}
