module.exports = (app) => {
   var model = app.model.pasta
   var joi = app.get("joi")
   var util = app.get("util")
   var fs = app.get("fs")
   var db = app.get("database")

   var pasta = {}

   var versao = "/v1"

   var run = util.promisify(db.run).bind(db)

   var all = util.promisify(db.all).bind(db)

   pasta.criar = async (req,res) => {
       let dados = req.body
       let result = joi.validate(dados,model)
       if (result.error!=null) {
         res.status(400).json(result.error)
       }
       else {
         let usuario = await all("SELECT * FROM users WHERE nick = ?",[dados.nick])
         let user = usuario[0]
         if (usuario.length==0) {
           res.status(404).json({"Mensagem":"Usuário não foi encontrado"})
         }
         else {
           let usuarioPasta = await all("SELECT id FROM folders WHERE idUsuario = ?",[user.id])
           if (usuarioPasta.length!=0) {
             res.status(409).json({"Mensagem":"Usuário já possui uma pasta"})
           }
           else {
             fs.mkdir("./data/" + dados.nomePasta, async (err) => {
                if (err) {
                   res.status(409).json({"Mensagem":"Pasta com o mesmo nome já existe"})
                }
                else {
                   await run("INSERT INTO folders (nomePasta,idUsuario) VALUES (?,?)",[dados.nomePasta,user.id])
                   let mensagem = {
                     "Mensagem": "Pasta criada com sucesso",
                     "urlFolder": `http://${req.headers.host}/${dados.nomePasta}`
                   }
                   res.status(201).json(mensagem)
                }
             })
           }
         }
       }
   }

   pasta.listar = async (req,res) => {
      let nomePasta = req.params.nomePasta
      let estado = await auth(req.user,nomePasta)
      if (estado==0) {
        fs.readdir("./data/" + nomePasta, (err,data) => {
           if (err) {
              res.status(404).json({"Mensagem":"Pasta não encontrada"})
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

   pasta.estatistica = async (req,res) => {
      let nomePasta = req.params.nomePasta
      let estado = await auth(req.user,nomePasta)
      if (estado==0) {
        fs.stat("./data/" + nomePasta, (err,data) => {
           if (err) {
              res.status(404).json({"Mensagem":"Verifique se o nome da pasta está correto"})
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

   pasta.editar = async (req,res) => {
      let nomePastaAtual = req.params.nomePastaAtual
      let estado = await auth(req.user,nomePastaAtual)
      if (estado==0) {
        let dados = req.body
        let result = joi.validate(dados,model)
        if (result.error!=null) {
           res.status(400).json(result.error)
        }
        else {
           let usuario = await all("SELECT * FROM users WHERE id = ?",[dados.idUsuario])
           if (usuario.length==0) {
             res.status(404).json({"Mensagem":"Usuário não foi encontrado"})
           }
           else {
             fs.rename("./data/" + nomePastaAtual,"./data/" + dados.nomePasta, async (err) => {
                if (err) {
                   res.status(404).json({"Mensagem":"Pasta com esse nome não existe"})
                }
                else {
                  await run("UPDATE folders SET nomePasta = ? WHERE idUsuario = ?",[dados.nomePasta,dados.idUsuario])
                  let mensagem = {
                    "Mensagem": "Pasta renomeada com sucesso",
                    "urlFolder": `http://${req.headers.host}/${dados.nomePasta}`
                  }
                  res.status(200).json(mensagem)
                }
             })
           }
        }
      }
      else {
        res.status(401).send("Unauthorized")
      }
   }

   pasta.remover = async (req,res) => {
      let nomePasta = req.params.nomePasta
      let estado = await auth(req.user,nomePasta)
      if (estado==0) {
        fs.rmdir("./data/" + nomePasta, async (err) => {
           if (err) {
             if (err.errno==-2) {
               res.status(404).json({"Mensagem":"Pasta não encontrada"})
             }
             if (err.errno==-39) {
               res.status(409).json({"Mensagem":"Pasta não está vazia"})
             }
           }
           else {
             let email = await all("SELECT id FROM users WHERE email = ?",[req.user])
             let idPasta = await all("SELECT id FROM folders WHERE idUsuario = ?",[email[0].id])
             await run("DELETE FROM folders WHERE id = ?",[idPasta[0].id])
             res.status(200).json({"Mensagem":"Pasta excluida com sucesso"})
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


   return pasta
}
