module.exports = (app) => {
  var fs = app.get("fs")
  var fsExtra = app.get("fs-extra")
  var formidable = app.get("formidable")
  var util = app.get("util")
  var db = app.get("database")

  var objeto = {}

  var versao = "/v1"

  var all = util.promisify(db.all).bind(db)

  objeto.salvarPasta = async (req, res) => {
    let auth = await authBearer(req.headers.authorization.slice(7), req.params.nomePasta)
    if (auth == true) {
      let nomePasta = req.params.nomePasta
      if (nomePasta) {
        let pasta = fs.existsSync("./data/" + nomePasta)
        if (pasta == false) {
          res.status(404).json({ "Mensagem": "Pasta com esse nome não existe" })
        }
        else {
          let form = new formidable.IncomingForm()

          form.parse(req, (err, fields, files) => { })

          form.on('file', (name, file) => {
            let objeto = file.name
            let obj = fs.existsSync(`./data/${nomePasta}/${objeto}`)
            if (obj == true) {
              let objetos = fs.readdirSync(`./data/${nomePasta}`)
              objeto = nomeObjeto(objetos, objeto)
            }
            let oldpath = file.path
            let newpath = "./data/" + nomePasta + "/" + objeto
            fsExtra.move(oldpath, newpath, (err) => {
              if (err) {                           
                res.status(500).json({ "Mensagem": "Verifique se o nome da pasta está correto e tente novamente" }).end()
              }
              else {
                let mensagem = {
                  "Mensagem": "Objeto salvo com sucesso",
                  "urlObjeto": `http://${req.headers.host}/${nomePasta}/${objeto}`
                }
                res.status(200).json(mensagem).end()
              }
            })
          })
        }
      }
      else {
        res.status(400).json({ "Mensagem": "O Parâmetro nome da pasta é necessário" })
      }
    }
    else {
      res.status(401).send("Unauthorized")
    }
  }

  objeto.salvarSubPasta = async (req, res) => {
    let auth = await authBearer(req.headers.authorization.slice(7), req.params.nomePasta)
    if (auth == true) {
      let nomePasta = req.params.nomePasta
      let nomeSubPasta = req.params.nomeSubPasta
      if (nomePasta == null || nomeSubPasta == null) {
        res.status(400).json({ "Mensagem": "O Parâmetro nome da pasta e da subpasta é necessário" })
      }
      else {
        let pasta = fs.existsSync("./data/" + nomePasta)
        let subPasta = fs.existsSync("./data/" + nomePasta + "/" + nomeSubPasta)
        if (pasta == false) {
          res.status(404).json({ "Mensagem": "Pasta com esse nome não existe" })
        }
        else if (subPasta == false) {
          res.status(404).json({ "Mensagem": "Subpasta com esse nome nessa pasta não existe" })
        }
        else {
          let form = new formidable.IncomingForm()

          form.parse(req, (err, fields, files) => { })

          form.on('file', (name, file) => {
            let objeto = file.name
            let obj = fs.existsSync(`./data/${nomePasta}/${nomeSubPasta}/${objeto}`)
            if (obj == true) {
              let objetos = fs.readdirSync(`./data/${nomePasta}/${nomeSubPasta}`)
              objeto = nomeObjeto(objetos, objeto)
            }
            let oldpath = file.path
            let newpath = "./data/" + nomePasta + "/" + nomeSubPasta + "/" + objeto
            fsExtra.move(oldpath, newpath, (err) => {
              if (err) {
                res.status(500).json({ "Mensagem": "Verifique se o nome da pasta e da subpasta está correto e tente novamente" }).end()
              }
              else {
                let mensagem = {
                  "Mensagem": "Objeto salvo com sucesso",
                  "urlObjeto": `http://${req.headers.host}/${nomePasta}/${nomeSubPasta}/${objeto}`
                }
                res.status(200).json(mensagem).end()
              }
            })
          })
        }
      }
    } 
    else {
      res.status(401).send('Unauthorized')
    }
  }

  objeto.listarPasta = async (req, res) => {
    let nomePasta = req.params.nomePasta
    let auth = false
    if (req.user==true) {
      auth = await authBearer(req.headers.authorization.slice(7),nomePasta)
    } 
    else {
      auth = await authDigest(req.user, nomePasta)
    }   
    if (auth == true) {
      let nomeObjeto = req.params.nomeObjeto
      fs.stat("./data/" + nomePasta + "/" + nomeObjeto, (err, stats) => {
        if (err) {
          res.status(404).json({ "Mensagem": "Verifique se o nome da pasta e do objeto está correto e tente novamente" })
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

  objeto.listarSubPasta = async (req, res) => {
    let nomePasta = req.params.nomePasta
    let auth = false
    if (req.user==true) {
      auth = await authBearer(req.headers.authorization.slice(7),nomePasta)
    } 
    else {
      auth = await authDigest(req.user, nomePasta)
    }   
    if (auth == true) {
      let nomeSubPasta = req.params.nomeSubPasta
      let nomeObjeto = req.params.nomeObjeto
      fs.stat("./data/" + nomePasta + "/" + nomeSubPasta + "/" + nomeObjeto, (err, stats) => {
        if (err) {
          res.status(404).json({ "Mensagem": "Verifique se o nome da pasta, subpasta e do objeto está correto e tente novamente" })
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

  objeto.removerPasta = async (req, res) => {
    let nomePasta = req.params.nomePasta
    let auth = await authBearer(req.headers.authorization.slice(7), nomePasta)
    if (auth == true) {
      let nomeObjeto = req.params.nomeObjeto
      fs.unlink("./data/" + nomePasta + "/" + nomeObjeto, (err) => {
        if (err) {
          res.status(404).json({ "Mensagem": "Verifique se o nome da pasta e do objeto está correto e tente novamente" })
        }
        else {
          res.status(200).json({ "Mensagem": "Objeto excluido com sucesso" })
        }
      })
    }
    else {
      res.status(401).send("Unauthorized")
    }
  }

  objeto.removerSubPasta = async (req, res) => {
    let nomePasta = req.params.nomePasta
    let auth = await authBearer(req.headers.authorization.slice(7), nomePasta)
    if (auth == true) {
      let nomeSubPasta = req.params.nomeSubPasta
      let nomeObjeto = req.params.nomeObjeto
      fs.unlink("./data/" + nomePasta + "/" + nomeSubPasta + "/" + nomeObjeto, (err) => {
        if (err) {
          res.status(404).json({ "Mensagem": "Verifique se o nome da pasta, subpasta e do objeto está correto e tente novamente" })
        }
        else {
          res.status(200).json({ "Mensagem": "Objeto excluido com sucesso" })
        }
      })
    }
    else {
      res.status(401).send("Unauthorized")
    }
  }

  async function authDigest(user, nomePasta) {
    try {
      let result = await all("SELECT id FROM users WHERE nick = ?", [user])
      let folder = await all("SELECT nomePasta FROM folders WHERE idUsuario = ?", [result[0].id])
      if (folder[0].nomePasta == nomePasta) {
        return true
      }
      else {
        return false
      }
    } catch (error) {
      return false
    }
  }

  async function authBearer(token, nomePasta) {
    try {
      let result = await all("SELECT id FROM users WHERE token = ?", [token])
      let folder = await all("SELECT nomePasta FROM folders WHERE idUsuario = ?", [result[0].id])
      if (folder[0].nomePasta == nomePasta) {
        return true
      }
      else {
        return false
      }
    } catch (error) {
      return false
    }
  }

  function nomeObjeto(objetos, objeto) {
    let split = objeto.split(".")
    let total = 0
    for (let i = 0; i < objetos.length; i++) {
      let pos = objetos[i].search(`${split[0]}-`)    
      if (pos > -1) {
        total++
      }
    }   
    return `${split[0]}-${total + 1}.${split[1]}`
  }

  return objeto
}
