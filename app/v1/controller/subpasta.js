module.exports = (app) => {
   var model = app.model.pasta
   var joi = app.get("joi")
   var util = app.get("util")
   var fs = app.get("fs")
   var db = app.get("database")

   var subpasta = {}

   var versao = "/v1"

   var all = util.promisify(db.all).bind(db)

   subpasta.criar = async (req,res) => {
      let nomePasta = req.params.nomePasta
      let estado = await auth(req.user,nomePasta)
      if (estado==0) {
        let dados = req.body
        let result = joi.validate(dados,model)
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
      else {
        res.status(401).send("Unauthorized")
      }
   }

   subpasta.listar = async (req,res) => {
      let nomePasta = req.params.nomePasta
      let estado = await auth(req.user,nomePasta)
      if (estado==0) {
        let nomeSubPasta = req.params.nomeSubPasta
        fs.readdir("./data/" + nomePasta + "/" + nomeSubPasta, (err,data) => {
           if (err) {
              res.status(404).json({"Mensagem":"Subpasta não encontrada"})
           }
           else {
              res.status(200).json(data)
           }
        })
      }
      else {
        res.stauts(401).send("Unauthorized")
      }
   }

   subpasta.estatistica = async (req,res) => {
      let nomePasta = req.params.nomePasta
      let estado = await auth(req.user,nomePasta)
      if (estado==0) {
        let nomeSubPasta = req.params.nomeSubPasta
        fs.stat("./data/" + nomePasta + "/" + nomeSubPasta, (err,data) => {
           if (err) {
              res.status(404).json({"Mensagem":"Verifique se o nome da pasta e da subpasta está correto"})
           }
           else {
             res.status(200).json(data)
           }
        })
      }
      else {
        res.status(401).send("Unauthorized")
      }
   }

   subpasta.editar = async (req,res) => {
      let nomePasta = req.params.nomePasta
      let estado = await auth(req.user,nomePasta)
      if (estado==0) {
        let nomeSubPastaAtual = req.params.nomeSubPastaAtual
        let dados = req.body
        let result = joi.validate(dados,model)
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
                  res.status(404).json({"Mensagem":"Não foi possivel criar uma subpasta, pois não existe uma pasta com esse nome"})
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
      else {
        res.status(401).send("Unauthorized")
      }
   }

   subpasta.remover = async (req,res) => {
      let nomePasta = req.params.nomePasta
      let estado = await auth(req.user,nomePasta)
      if (estado==0) {
        let nomeSubPasta = req.params.nomeSubPasta
        fs.rmdir("./data/" + nomePasta + "/" + nomeSubPasta, (err) => {
           if (err) {
              res.status(404).json({"Mensagem":"Subpasta não encontrada"})
           }
           else {
              res.status(200).json({"Mensagem":"Pasta excluida com sucesso"})
           }
        })
      }
      else {
        res.status(401).send("Unauthorized")
      }
   }

   async function auth(user,pasta) {
     let result = await all("SELECT id FROM users WHERE email = ?",[user])
     let folder = await all("SELECT name_folder FROM folders WHERE user_id = ?",[result[0].id])
     if (folder[0].name_folder==pasta) {
        return 0
     }
     else {
        return 1
     }
   }


   return subpasta
}
