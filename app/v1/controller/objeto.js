module.exports = (app) => {
   var fs = app.get("fs")
   var fsExtra = app.get("fs-extra")
   var formidable = app.get("formidable")
   var util = app.get("util")
   var db = app.get("database")

   var objeto = {}

   var versao = "/v1"

   var all = util.promisify(db.all).bind(db)

   objeto.salvarPasta = async (req,res) => {
      let nomePasta = req.params.nomePasta
      if (nomePasta) {
        let form = new formidable.IncomingForm()
        form.parse(req, (err,fields,files) => {
          let pasta = fs.existsSync("./data/" + nomePasta)
          if (pasta==false) {
            res.status(404).json({"Mensagem":"Pasta com esse nome não existe"})
          }
          else {
            let objeto = files.file.name
            let obj = fs.existsSync(`./data/${nomePasta}/${objeto}`)
            if (obj==true) {
              let objetos = fs.readdirSync(`./data/${nomePasta}`)
              let split = objeto.split(".")
              let total = 0
              for(let i = 0; i < objetos.length; i++) {
                let pos = objetos[i].search(`${split[0]}-`)
                if (pos>-1) {
                  total++
                }
              }
              objeto = `${split[0]}-${total+1}.${split[1]}`
            }
            let oldpath = files.file.path
            let newpath = "./data/" + nomePasta + "/" + objeto
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
          }
        })
      }
      else {
         res.status(400).json({"Mensagem":"O Parâmetro nome da pasta é necessário"})
      }
   }

   objeto.salvarSubPasta = async (req,res) => {
     let nomePasta = req.params.nomePasta
     let nomeSubPasta = req.params.nomeSubPasta
     if (nomePasta==null||nomeSubPasta==null) {
       res.status(400).json({"Mensagem":"O Parâmetro nome da pasta e da subpasta é necessário"})
     }
     else {
       let form = new formidable.IncomingForm()
       let nomeSubPasta = req.params.nomeSubPasta
       form.parse(req,(err,fields,files) => {
           let pasta = fs.existsSync("./data/" + nomePasta)
           let subPasta = fs.existsSync("./data/" + nomePasta + "/" + nomeSubPasta)
           if (pasta==false) {
             res.status(404).json({"Mensagem":"Pasta com esse nome não existe"})
           }
           else if (subPasta==false) {
             res.status(404).json({"Mensagem":"Subpasta com esse nome nessa pasta não existe"})
           }
           else {
             let objeto = files.file.name
             let obj = fs.existsSync(`./data/${nomePasta}/${nomeSubPasta}/${objeto}`)
             if (obj==true) {
               let objetos = fs.readdirSync(`./data/${nomePasta}/${nomeSubPasta}`)
               let split = objeto.split(".")
               let total = 0
               for(let i = 0; i < objetos.length; i++) {
                 let pos = objetos[i].search(`${split[0]}-`)
                 if (pos>-1) {
                   total++
                 }
               }
               objeto = `${split[0]}-${total+1}.${split[1]}`
             }
             let oldpath = files.file.path
             let newpath = "./data/" + nomePasta + "/" + nomeSubPasta + "/" + objeto
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
           }
       })
     }
   }

   objeto.listarPasta = async (req,res) => {
      let nomePasta = req.params.nomePasta
      let estado = await auth(req.user,nomePasta)
      if (estado==0) {
        let nomeObjeto = req.params.nomeObjeto
        fs.stat("./data/" + nomePasta + "/" + nomeObjeto,(err,stats) => {
           if (err) {
              res.status(404).json({"Mensagem":"Verifique se o nome da pasta e do objeto está correto e tente novamente"})
           }
           else {
              res.status(200).json(stats)
           }
        })
      }
      else {
        res.status(401).send("Unauthorized")
      }
   }

   objeto.listarSubPasta = async (req,res) => {
      let nomePasta = req.params.nomePasta
      let estado = await auth(req.user,nomePasta)
      if (estado==0) {
        let nomeSubPasta = req.params.nomeSubPasta
        let nomeObjeto = req.params.nomeObjeto
        fs.stat("./data/" + nomePasta + "/" + nomeSubPasta + "/" + nomeObjeto,(err,stats) => {
           if (err) {
              res.status(404).json({"Mensagem":"Verifique se o nome da pasta, subpasta e do objeto está correto e tente novamente"})
           }
           else {
              res.status(200).json(stats)
           }
        })
      }
      else {
        res.status(401).send("Unauthorized")
      }
   }

   objeto.removerPasta = async (req,res) => {
      let nomePasta = req.params.nomePasta
      let estado = await auth(req.user,nomePasta)
      if (estado==0) {
        let nomeObjeto = req.params.nomeObjeto
        fs.unlink("./data/" + nomePasta + "/" + nomeObjeto, (err) => {
           if (err) {
              res.status(404).json({"Mensagem":"Verifique se o nome da pasta e do objeto está correto e tente novamente"})
           }
           else {
              res.status(200).json({"Mensagem":"Objeto excluido com sucesso"})
           }
        })
      }
      else {
        res.status(401).send("Unauthorized")
      }
    }

    objeto.removerSubPasta = async (req,res) => {
       let nomePasta = req.params.nomePasta
       let estado = await auth(req.user,nomePasta)
       if (estado==0) {
         let nomeSubPasta = req.params.nomeSubPasta
         let nomeObjeto = req.params.nomeObjeto
         fs.unlink("./data/" + nomePasta + "/" + nomeSubPasta + "/" + nomeObjeto, (err) => {
            if (err) {
               res.status(404).json({"Mensagem":"Verifique se o nome da pasta, subpasta e do objeto está correto e tente novamente"})
            }
            else {
               res.status(200).json({"Mensagem":"Objeto excluido com sucesso"})
            }
         })
       }
       else {
         res.status(401).send("Unauthorized")
       }
    }

    async function auth(user,pasta) {
      let result = await all("SELECT id FROM users WHERE email = ?",[user])
      let folder = await all("SELECT nomePasta FROM folders WHERE idUsuario = ?",[result[0].id])
      if (folder[0].nomePasta==pasta) {
         return 0
      }
      else {
         return 1
      }
    }

    return objeto
}
