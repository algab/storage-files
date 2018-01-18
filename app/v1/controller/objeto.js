module.exports = (app) => {
   var fs = app.get("fs");
   var fsExtra = app.get("fs-extra");
   var formidable = app.get("formidable")
   var hasha = app.get("hasha");
   var path = app.get("path");

   var objeto = {};

   var versao = "/v1";

   objeto.salvarPasta = (req,res) => {
      let form = new formidable.IncomingForm();
      let nomePasta = req.params.nomePasta;
      form.parse(req,(err,fields,files) => {
          let num = Math.floor(Math.random() * (1000-1));
          let oldpath = files.file.path;
          let name = hasha(`${oldpath}${num}`,{algorithm:"md5"});
          let pathObjeto = path.extname(files.file.name);
          let objeto = `${name}${pathObjeto}`;
          let newpath = "./data/" + nomePasta + "/" + objeto;
          fsExtra.move(oldpath,newpath,(err) => {
             if (err) {
                res.status(500).json({"Mensagem":"Verifique se o nome da pasta está correto e tente novamente"}).end()
             }
             else {
               let mensagem = {
                  "Mensagem" : "Objeto salvo com sucesso",
                  "urlObjeto" : `http://${req.headers.host}/${nomePasta}/${objeto}`
               }
               res.status(200).json(mensagem).end()
             }
          })
      })
   }

   objeto.salvarSubPasta = (req,res) => {
     let form = new formidable.IncomingForm();
     let nomePasta = req.params.nomePasta;
     let nomeSubPasta = req.params.nomeSubPasta;
     form.parse(req,(err,fields,files) => {
         let num = Math.floor(Math.random() * (1000-1));
         let oldpath = files.file.path;
         let name = hasha(`${oldpath}${num}`,{algorithm:"md5"});
         let pathObjeto = path.extname(files.file.name);
         let objeto = `${name}${pathObjeto}`;
         let newpath = "./data/" + nomePasta + "/" + nomeSubPasta + "/" + objeto;
         fsExtra.move(oldpath,newpath,(err) => {
            if (err) {
               res.status(500).json({"Mensagem":"Verifique se o nome da pasta e da subpasta está correto e tente novamente"}).end()
            }
            else {
               let mensagem = {
                  "Mensagem" : "Objeto salvo com sucesso",
                  "urlObjeto" : `http://${req.headers.host}/${nomePasta}/${nomeSubPasta}/${objeto}`
               }
               res.status(200).json(mensagem).end()
            }
         })
     })
   }

   objeto.listarPasta = (req,res) => {
      let nomePasta = req.params.nomePasta;
      let nomeObjeto = req.params.nomeObjeto;
      fs.stat("./data/" + nomePasta + "/" + nomeObjeto,(err,stats) => {
         if (err) {
            res.status(404).json({"Mensagem":"Verifique se o nome da pasta e do objeto está correto e tente novamente"})
         }
         else {
            res.status(200).json(stats)
         }
      })
   }

   objeto.listarSubPasta = (req,res) => {
      let nomePasta = req.params.nomePasta;
      let nomeSubPasta = req.params.nomeSubPasta;
      let nomeObjeto = req.params.nomeObjeto;
      fs.stat("./data/" + nomePasta + "/" + nomeSubPasta + "/" + nomeObjeto,(err,stats) => {
         if (err) {
            res.status(404).json({"Mensagem":"Verifique se o nome da pasta, subpasta e do objeto está correto e tente novamente"})
         }
         else {
            res.status(200).json(stats)
         }
      })
   }

   objeto.removerPasta = (req,res) => {
      let nomePasta = req.params.nomePasta;
      let nomeObjeto = req.params.nomeObjeto;
      fs.unlink("./data/" + nomePasta + "/" + nomeObjeto, (err) => {
         if (err) {
            res.status(404).json({"Mensagem":"Verifique se o nome da pasta e do objeto está correto e tente novamente"})
         }
         else {
            res.status(200).json({"Mensagem":"Objeto excluido com sucesso"})
         }
      })
    }

    objeto.removerSubPasta = (req,res) => {
       let nomePasta = req.params.nomePasta;
       let nomeSubPasta = req.params.nomeSubPasta;
       let nomeObjeto = req.params.nomeObjeto;
       fs.unlink("./data/" + nomePasta + "/" + nomeSubPasta + "/" + nomeObjeto, (err) => {
          if (err) {
             res.status(404).json({"Mensagem":"Verifique se o nome da pasta, subpasta e do objeto está correto e tente novamente"})
          }
          else {
             res.status(200).json({"Mensagem":"Objeto excluido com sucesso"})
          }
       })
     }

   return objeto;
}
