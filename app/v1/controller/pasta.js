module.exports = (app) => {
   var model = app.model.pasta;
   var joi = app.get("joi");
   var fs = app.get("fs");

   var pasta = {};

   var versao = "/v1";

   pasta.criar = (req,res) => {
       let dados = req.body;
       let result = joi.validate(dados,model);
       if (result.error!=null) {
          res.status(400).json(result.error)
       }
       else {
          fs.mkdir("./data/" + dados.nomePasta,(err) => {
             if (err) {
                res.status(409).json({"Mensagem":"Pasta com o mesmo nome já existe"})
             }
             else {
                let mensagem = {
                  "Mensagem": "Pasta criada com sucesso",
                  "urlFolder": `http://${req.headers.host}${versao}/${dados.nomePasta}`
                }
                res.status(201).json(mensagem)
             }
          })
       }
   }

   pasta.listar = (req,res) => {
      let nomePasta = req.params.nomePasta;
      fs.readdir("./data/" + nomePasta, (err,data) => {
         if (err) {
            res.status(404).json({"Mensagem":"Pasta não encontrada"})
         }
         else {
            res.status(200).json(data)
         }
      })
   }

   pasta.estatistica = (req,res) => {
      let nomePasta = req.params.nomePasta;
      fs.stat("./data/" + nomePasta, (err,data) => {
         if (err) {
            res.status(404).json({"Mensagem":"Verifique se o nome da pasta está correto"})
         }
         else {
           res.status(200).json(data)
         }
      })
   }

   pasta.editar = (req,res) => {
      let nomePastaAtual = req.params.nomePastaAtual;
      let dados = req.body;
      let result = joi.validate(dados,model);
      if (result.error!=null) {
         res.status(400).json(result.error)
      }
      else {
         fs.rename("./data/" + nomePastaAtual,"./data/" + dados.nomePasta, (err) => {
            if (err) {
               res.status(404).json({"Mensagem":"Pasta com esse nome não existe"})
            }
            else {
              let mensagem = {
                "Mensagem": "Pasta renomeada com sucesso",
                "urlFolder": `http://${req.headers.host}${versao}/${dados.nomePasta}`
              }
              res.status(200).json(mensagem)
            }
         })
      }
   }

   pasta.remover = (req,res) => {
      let nomePasta = req.params.nomePasta;
      fs.rmdir("./data/" + nomePasta, (err) => {
         if (err) {
           if (err.errno==-2) {
             res.status(404).json({"Mensagem":"Pasta não encontrada"})
           }
           if (err.errno==-39) {
             res.status(409).json({"Mensagem":"Pasta não está vazia"})
           }
         }
         else {
           res.status(200).json({"Mensagem":"Pasta excluida com sucesso"})
         }
      })
   }


   return pasta;
}
