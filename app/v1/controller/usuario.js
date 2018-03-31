module.exports = (app) => {
   var model = app.model.usuario
   var login = app.model.login
   var joi = app.get("joi")
   var util = app.get("util")
   var db = app.get("database")

   var usuario = {}

   var versao = "/v1"

   var all = util.promisify(db.all).bind(db)

   usuario.salvar = async (req,res) => {
      let dados = req.body
      let result = joi.validate(dados,model)
      if (result.error!=null) {
        res.status(400).json(result.error)
      }
      else {
        let email = await all("SELECT email FROM users WHERE email = ?",[dados.email])
        if (email.length!=0) {
          res.status(409).json({"Mensagem":"Já existe usuário com o mesmo email"})
        }
        else {
          db.run("INSERT INTO users (nomeUsuario,dataNascimento,sexo,email,password) VALUES (?,?,?,?,?)",[dados.nomeUsuario,dados.dataNascimento,dados.sexo,dados.email,dados.password],(err,result) => {
             if (err) {
                res.status(500).json(err)
             }
             else {
                let mensagem = {
                  "Mensagem": "Usuário cadastrado com sucesso",
                  "_links": [
                    {"rel":"Criar Pasta","method":"POST","href":`${req.headers.host}/pastas`},
                    {"rel":"Login","method":"PUT","href":`${req.headers.host}/usuarios/login`}
                  ]
                }
                res.status(201).json(mensagem)
             }
          })
        }
      }
   }

   usuario.listarUser = (req,res) => {
     let id = req.params.id
     db.all("SELECT * FROM users WHERE id = ?",[id],(err,result) => {
        if (err) {
          res.status(500).json(err)
        }
        else {
          if (result.length==0) {
            res.status(404).json({"Mensagem":"Usuário não encontrado"})
          }
          else {
            result[0]._links = [
              {"rel":"Editar Usuário","method":"PUT","href":`${req.headers.host}/usuarios/${id}`},
              {"rel":"Excluir Usuário","method":"DELETE","href":`${req.headers.host}/usuarios/${id}`}
            ]
            res.status(200).json(result[0])
          }
        }
     })
   }

   usuario.login = (req,res) => {
     let dados = req.body
     let result = joi.validate(dados,login)
     if (result.error!=null) {
       res.status(400).json(result.error)
     }
     else {
       db.all("SELECT * FROM users WHERE email = ? and password = ?",[dados.email,dados.password],(err,result) => {
         if (err) {
           res.status(500).json(err)
         }
         else {
           if (result==null) {
             res.status(404).json({"Mensagem":"Email ou senha estão incorretos"})
           }
           else {
             result[0]._links = [
               {"rel":"Criar Usuário","method":"POST","href":`${req.headers.host}/usuarios`},
               {"rel":"Criar Pasta","method":"POST","href":`${req.headers.host}/pastas`}
             ]
             res.status(200).json(result[0])
           }
         }
       })
     }
   }

   usuario.editar = (req,res) => {
     let id = req.params.id
     let dados = req.body
     let result = joi.validate(dados,model)
     if (result.error!=null) {
       res.status(400).json(result.error)
     }
     else {
       db.run("UPDATE users SET nomeUsuario = ?, dataNascimento = ?, sexo = ?, email = ?, password = ? WHERE id = ?",[dados.nomeUsuario,dados.dataNascimento,dados.sexo,dados.email,dados.password,id],(err,result) => {
         if (err) {
            res.status(500).json(err)
         }
         else {
            let mensagem = {
              "Mensagem": "Usuário atualizado com sucesso",
              "_links": [
                {"rel":"Procurar Usuário","method":"GET","href":`${req.headers.host}/usuarios/${id}`},
                {"rel":"Excluir Usuário","method":"DELETE","href":`${req.headers.host}/usuarios/${id}`}
              ]
            }
            res.status(200).json(mensagem)
         }
       })
     }
   }

   usuario.deletar = async (req,res) => {
      let id = req.params.id
      db.run("DELETE FROM users WHERE id = ?",[id],(err,result) => {
         if (err) {
           res.status(500).json(err)
         }
         else {
           let mensagem = {
             "Mensagem": "Usuário atualizado com sucesso",
             "_links": [
               {"rel":"Procurar Usuário","method":"GET","href":`${req.headers.host}/usuarios/${id}`},
               {"rel":"Editar Usuário","method":"PUT","href":`${req.headers.host}/usuarios/${id}`}
             ]
           }
           res.status(200).json(mensagem)
         }
      })
   }


   return usuario
}
