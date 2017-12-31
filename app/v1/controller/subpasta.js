module.exports = (app) => {
   var model = app.model.pasta;
   var joi = app.get("joi");
   var fs = app.get("fs");

   var subpasta = {};

   var versao = "/v1";

   subpasta.criar = (req,res) => {
      let nomePasta = req.params.nomePasta;
      let dados = req.body;
      let result = joi.validate(dados,model);
      if (result.error!=null) {
         res.status(400).json(result.error)
      }
      else {
         fs.mkdir("./data/" + nomePasta + "/" + dados.nomePasta, (err) => {
            if (err) {
               if (err.errno==-17) {
                  res.status(409).json({"Mensagem":"Nessa determinada pasta já existe uma subpasta com o mesmo nome"})
               }
               if (err.errno==-2) {
                  res.status(404).json({"Mensagem":"Não foi possivel criar uma subpasta, pois não existe pasta com esse nome"})
               }
            }
            else {
              let mensagem = {
                "Mensagem": "Pasta criada com sucesso",
                "urlFolder": `http://${req.headers.host}${versao}/${nomePasta}/${dados.nomePasta}`
              }
              res.status(201).json(mensagem)
            }
         })
      }
   }

   subpasta.listar = (req,res) => {
      let nomePasta = req.params.nomePasta;
      let nomeSubPasta = req.params.nomeSubPasta;
      fs.readdir("./data/" + nomePasta + "/" + nomeSubPasta, (err,data) => {
         if (err) {
            res.status(404).json({"Mensagem":"Subpasta não encontrada"})
         }
         else {
            res.status(200).json(data)
         }
      })
   }

   subpasta.editar = (req,res) => {
      let nomePasta = req.params.nomePasta;
      let nomeSubPastaAtual = req.params.nomeSubPastaAtual;
      let dados = req.body;
      let result = joi.validate(dados,model);
      if (result.error!=null) {
         res.status(409).json(result.error)
      }
      else {
        fs.rename("./data/" + nomePasta + "/" + nomeSubPastaAtual,"./data/" + nomePasta + "/" + dados.nomePasta, (err) => {
           if (err) {
             if (err.errno==-17) {
                res.status(409).json({"Mensagem":"Nessa determinada pasta já existe uma subpasta com o mesmo nome"})
             }
             if (err.errno==-2) {
                res.status(404).json({"Mensagem":"Não foi possivel criar uma subpasta, pois não existe uma pasta ou subpasta com esse nome"})
             }
           }
           else {
             let mensagem = {
               "Mensagem": "Pasta renomeada com sucesso",
               "urlFolder": `http://${req.headers.host}${versao}/${nomePasta}/${dados.nomePasta}`
             }
             res.status(200).json(mensagem)
           }
        })
      }
   }

   subpasta.remover = (req,res) => {
      let nomePasta = req.params.nomePasta;
      let nomeSubPasta = req.params.nomeSubPasta;
      fs.rmdir("./data/" + nomePasta + "/" + nomeSubPasta, (err) => {
         if (err) {
            res.status(404).json({"Mensagem":"Subpasta não encontrada"})
         }
         else {
            res.status(200).json({"Mensagem":"Pasta excluida com sucesso"})
         }
      })
   }

   return subpasta;
}
