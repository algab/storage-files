module.exports = (app) => {
   var model = app.model.pasta
   var modelUser = app.model.user
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
       let result = joi.validate({"nomePasta":dados.nomePasta},model)
       if (result.error!=null) {
          res.status(400).json(result.error)
       }
       else {
          let result_user = joi.validate({"nameUser":dados.nameUser,"email":dados.email,"password":dados.password},modelUser)
          if (result_user.error!=null) {
            res.status(400).json(result_user.error)
          } else {
            let valor = await all("SELECT email FROM users WHERE email = ?",[dados.email])
            if (valor.length!=0) {
              res.status(409).json({"Mensagem":"Já existe usuario com o mesmo email"})
            }
            else {
              fs.mkdir("./data/" + dados.nomePasta, async (err) => {
                 if (err) {
                    res.status(409).json({"Mensagem":"Pasta com o mesmo nome já existe"})
                 }
                 else {
                    await run("INSERT INTO users (name_user,email,password) VALUES (?,?,?)",[dados.nameUser,dados.email,dados.password])
                    let valor = await all("SELECT id FROM users WHERE email = ?",[dados.email])
                    await run("INSERT INTO folders (name_folder,user_id) VALUES (?,?)",[dados.nomePasta,valor[0].id])
                    let mensagem = {
                      "Mensagem": "Pasta criada com sucesso",
                      "urlFolder": `http://${req.headers.host}${versao}/${dados.nomePasta}`
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
             res.status(200).json(data)
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
      else {
        res.status(401).send("Unauthorized")
      }
   }

   pasta.remover = async (req,res) => {
      let nomePasta = req.params.nomePasta
      let estado = await auth(req.user,nomePasta)
      if (estado==0) {
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


   return pasta
}
