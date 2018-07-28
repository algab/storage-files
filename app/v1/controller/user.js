module.exports = (app) => {
  var model = app.model.user
  var joi = app.get("joi")
  var util = app.get("util")
  var db = app.get("database")

  var user = {}

  var version = "/v1"

  var all = util.promisify(db.all).bind(db)

  user.save = async (req, res) => {
    let data = req.body
    let result = joi.validate(data, model)
    if (result.error) {
      res.status(400).json(result.error)
    }
    else {
      try {
        let email = await all("SELECT email FROM users WHERE email = ?", [data.email])
        let nick = await all("SELECT nick FROM users WHERE nick = ?", [data.nick])
        if (email.length != 0) {
          res.status(409).json({ "Message": "Email already exists" })
        }
        else if (nick.length != 0) {
          res.status(409).json({ "Message": "Nick already exists" })
        }
        else {
          let token = app.get("hasha")(`${data.nick}/${data.password}/${new Date().getTime()}`, { 'algorithm': 'md5' })          
          db.run("INSERT INTO users (name,birthday,sexo,nick,email,password,token) VALUES (?,?,?,?,?,?,?)", [data.name, data.birthday, data.sexo, data.nick, data.email, data.password, token], async (err, result) => {
            if (err) {
              res.status(500).json({ "Message" : "Server Error" }).end()
            }
            else {
              let usuario = await all("SELECT id FROM users ORDER BY id DESC LIMIT 1")
              let message = {"Message": "User save successful","idUser": usuario[0].id,"token": token}
              message['_links'] = [
                { "rel": "Create Folder", "method": "POST", "href": `http://${req.headers.host}${version}/users` },
                { "rel": "Login", "method": "PUT", "href": `http://${req.headers.host}${version}/users/login` }
              ]
              res.status(201).json(message)
            }
          })
        }
      } catch (error) {
        res.status(500).json({ "Message" : "Server Error" }).end()
      }
    }
  }

  user.list = (req, res) => {
    db.all("SELECT * FROM users", (err, result) => {
      if (err) {
        res.status(500).json(err).end()
      }
      else {
        result.push([
          { "rel": "Create Folder", "method": "POST", "href": `http://${req.headers.host}${version}/users` },
          { "rel": "Login", "method": "PUT", "href": `http://${req.headers.host}${version}/users/login` }
        ])
        res.status(200).json(result).end()
      }
    })
  }

  user.search = (req, res) => {
    let id = req.params.id
    db.all("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
      if (err) {
        res.status(500).json(err).end()
      }
      else {        
        if (result.length == 0) {
          res.status(404).json({ "Message": "User not found" }).end()
        }
        else {
          let user = result[0]
          db.all("SELECT nameFolder FROM folders WHERE idUser = ?", [id], (err, result) => {
            if (result[0]) {
              user.nameFolder = result[0].nameFolder
            }
            user._links = [
              { "rel": "Edit User", "method": "PUT", "href": `http://${req.headers.host}${version}/users/${id}` },
              { "rel": "Delete User", "method": "DELETE", "href": `http://${req.headers.host}${version}/users/${id}` }
            ]
            res.status(200).json(user)
          })
        }
      }
    })
  }

  user.login = (req, res) => {
    let data = req.body
    if (data.email && data.password) {      
      db.all("SELECT * FROM users WHERE email = ? and password = ?", [data.email, data.password], (err, result) => {
        if (err) {
          res.status(500).json(err).end()
        }
        else {
          if (result[0] == null) {
            res.status(404).json({ "Message": "User not found" }).end()
          }
          else {
            let user = result[0]
            db.all("SELECT nameFolder FROM folders WHERE idUser = ?", [user.id], (err, result) => {
              if (result[0]) {
                user.nameFolder = result[0].nameFolder
              } 
              user._links = [
                { "rel": "Create User", "method": "POST", "href": `http://${req.headers.host}${version}/users` },
                { "rel": "Create Folder", "method": "POST", "href": `http://${req.headers.host}${version}/pastas` }
              ]
              res.status(200).json(user).end()
            })
          }
        }
      })
    }
    else {
      res.status(400).json({ "Message": "Email and password required" }).end()
    }
  }

  user.edit = (req, res) => {
    let id = req.params.id
    let data = req.body
    let result = joi.validate(data, model)
    if (result.error) {
      res.status(400).json(result.error).end()
    }
    else {
      db.run("UPDATE users SET name = ?, birthday = ?, sexo = ?, nick = ?, email = ?, password = ? WHERE id = ?", [data.name, data.birthday, data.sexo, data.nick, data.email, data.password, id], (err, result) => {
        if (err) {
          res.status(500).json(err).end()
        }
        else {
          let message = {"Message": "User updated successful"}
          message['_links'] = [
            { "rel": "Found User", "method": "GET", "href": `http://${req.headers.host}${version}/users/${id}` },
            { "rel": "Delete User", "method": "DELETE", "href": `http://${req.headers.host}${version}/users/${id}` }
          ]
          res.status(200).json(message).end()
        }
      })
    }
  }

  user.delete = async (req, res) => {
    let id = req.params.id
    db.run("DELETE FROM users WHERE id = ?", [id], (err, result) => {
      if (err) {
        res.status(500).json(err).end()
      }
      else {
        let mensagem = {"Message": "User removed successful"}
        message['_links'] = [
          { "rel": "Found User", "method": "GET", "href": `http://${req.headers.host}${version}/users/${id}` },
          { "rel": "Edit User", "method": "PUT", "href": `http://${req.headers.host}${version}/users/${id}` }
        ]
        res.status(200).json(message).end()
      }
    })
  }

  return user
}
