module.exports = (app) => {
   var model = app.model.subpasta
   var joi = app.get("joi")
   var util = app.get("util")
   var fs = app.get("fs")
   var db = app.get("database")

   var subpasta = {}

   var versao = "/v1"

   var all = util.promisify(db.all).bind(db)

   subpasta.criar = async (req,res) => {
      let dados = req.body
      let estado = await auth(req.user,dados.nomePasta)
      if (estado==0) {
        let result = joi.validate(dados,model)
        if (result.error!=null) {
           res.status(400).json(result.error)
        }
        else {
           fs.mkdir("./data/" + dados.nomePasta + "/" + dados.nomeSubpasta, (err) => {
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
                  "Mensagem": "Subpasta criada com sucesso",
                  "urlFolder": `http://${req.headers.host}/${dados.nomePasta}/${dados.nomeSubpasta}`
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
             doc = {
               "Acesso": {
                 "Data": gerarData(data.atime),
                 "Hora": gerarHora(data.atime)
               },
               "Modificado": {
                 "Data": gerarData(data.mtime),
                 "Hora": gerarHora(data.mtime)
               },
               "Alterado": {
                 "Data": gerarData(data.ctime),
                 "Hora": gerarHora(data.ctime)
               },
               "Criado": {
                 "Data": gerarData(data.birthtime),
                 "Hora": gerarHora(data.birthtime)
               }
             }
             res.status(200).json(doc)
           }
        })
      }
      else {
        res.status(401).send("Unauthorized")
      }
   }

   subpasta.editar = async (req,res) => {
      let dados = req.body
      let estado = await auth(req.user,dados.nomePasta)
      if (estado==0) {
        let nomeSubPastaAtual = req.params.nomeSubPastaAtual
        let result = joi.validate(dados,model)
        if (result.error!=null) {
           res.status(409).json(result.error)
        }
        else {
          fs.rename("./data/" + dados.nomePasta + "/" + nomeSubPastaAtual,"./data/" + dados.nomePasta + "/" + dados.nomeSubpasta, (err) => {
             if (err) {
               if (err.errno==-17) {
                  res.status(409).json({"Mensagem":"Nessa determinada pasta já existe uma subpasta com o mesmo nome"})
               }
               if (err.errno==-2) {
                  res.status(404).json({"Mensagem":"Não foi possivel renomear subpasta, pois não existe uma pasta ou subpasta com esse nome"})
               }
             }
             else {
               let mensagem = {
                 "Mensagem": "Subpasta renomeada com sucesso",
                 "urlFolder": `http://${req.headers.host}/${dados.nomePasta}/${dados.nomeSubpasta}`
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
              if (err.errno==-39) {
                 res.status(409).json({"Mensagem":"Subpasta não está vazia"})
              }
              else {
                 res.status(404).json({"Mensagem":"Subpasta não encontrada"})
              }
           }
           else {
              res.status(200).json({"Mensagem":"Subpasta excluida com sucesso"})
           }
        })
      }
      else {
        res.status(401).send("Unauthorized")
      }
   }

   async function auth(user,pasta) {
     let result = await all("SELECT id FROM users WHERE nick = ?",[user])
     let folder = await all("SELECT nomePasta FROM folders WHERE idUsuario = ?",[result[0].id])
     if (folder[0].nomePasta==pasta) {
        return 0
     }
     else {
        return 1
     }
   }

   function gerarData(time) {
      let data = new Date(time)
      return `${data.getDate()}/${data.getMonth()}/${data.getFullYear()}`
   }

   function gerarHora(time) {
      let hora = new Date(time)
      return `${hora.getHours()}:${hora.getMinutes()}:${hora.getSeconds()}`
   }



   return subpasta
}
