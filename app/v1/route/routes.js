module.exports = (app) => {
   var pasta = app.controller.pasta;
   var subpasta = app.controller.subpasta;
   var objeto = app.controller.objeto;

   var versao = "/v1";

   // Pasta
   app.get("/:nomePasta", pasta.listar);
   app.post(versao + "/pastas", pasta.criar);
   app.get(versao + "/pastas/:nomePasta", pasta.estatistica);
   app.put(versao + "/pastas/:nomePastaAtual", pasta.editar);
   app.delete(versao + "/pastas/:nomePasta", pasta.remover);

   // SubPasta
   app.get("/:nomePasta/:nomeSubPasta", subpasta.listar);
   app.post(versao + "/pastas/:nomePasta/subpasta", subpasta.criar);
   app.get(versao + "/pastas/:nomePasta/subpasta/:nomeSubPasta", subpasta.estatistica);
   app.put(versao + "/pastas/:nomePasta/subpasta/:nomeSubPastaAtual", subpasta.editar);
   app.delete(versao + "/pastas/:nomePasta/subpasta/:nomeSubPasta", subpasta.remover);

   //Objeto
   app.post(versao + "/pastas/:nomePasta/objeto", objeto.salvarPasta);
   app.post(versao + "/pastas/:nomePasta/subpasta/:nomeSubPasta/objeto", objeto.salvarSubPasta);
   app.get(versao + "/pastas/:nomePasta/objeto/:nomeObjeto", objeto.listarPasta);
   app.get(versao + "/pastas/:nomePasta/subpasta/:nomeSubPasta/objeto/:nomeObjeto", objeto.listarSubPasta);
   app.delete(versao + "/pastas/:nomePasta/objeto/:nomeObjeto", objeto.removerPasta);
   app.delete(versao + "/pastas/:nomePasta/subpasta/:nomeSubPasta/objeto/:nomeObjeto", objeto.removerSubPasta);
}
