module.exports = (app) => {
  var model = app.model.user
  var joi = app.get("joi")
  var util = app.get("util")
  var db = app.get("database")

  var user = {}

  var all = util.promisify(db.all).bind(db)

  user.save = async (req, res) => {
    let data = req.body
    let result = joi.validate(data, model)
    if (result.error) {
      res.status(400).json(result.error).end()
    }
    else {
      try {
        let email = await all("SELECT email FROM users WHERE email = ?", [data.email])
        if (email.length != 0) {
          res.status(409).json({ "Message": "Email already exists" })
        }
        else {
          let nick = await all("SELECT nick FROM users WHERE nick = ?", [data.nick])
          if (nick.length != 0) {
            res.status(409).json({ "Message": "Nick already exists" })
          }
          else {
            let token = app.get("hasha")(`${data.nick}/${data.password}/${new Date().getTime()}`, { 'algorithm': 'md5' })
            db.run("INSERT INTO users (name,nick,email,password,token,date) VALUES (?,?,?,?,?,?)", [data.name, data.nick, data.email, data.password, token, new Date()], async (err, result) => {
              if (err) {
                res.status(500).json({ "Message": "Server Error" }).end()
              }
              else {
                let user = await all("SELECT id FROM users ORDER BY id DESC LIMIT 1")
                let message = { "Message": "User saved successful", "idUser": user[0].id, "token": token }
                res.status(201).json(message).end()
              }
            })
          }
        }
      } catch (error) {
        res.status(500).json({ "Message": "Server Error" }).end()
      }
    }
  }

  user.list = (req, res) => {
    db.all("SELECT * FROM users", (err, result) => {
      if (err) {
        res.status(500).json(err).end()
      }
      else {
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
          res.status(200).json(result[0]).end()
        }
      }
    })
  }

  user.folder = (req, res) => {
    let id = req.params.id
    db.all("SELECT * FROM folders WHERE idUser = ?", [id], (err, result) => {
      if (err) {
        res.status(500).json({ "Message": "Server Error" }).end()
      }
      else {        
        if (result.length == 0) {
          res.status(404).json({ "Message": "Folder not found" }).end()
        }
        else {
          res.status(200).json(result[0]).end()
        }
      }
    })
  }

  user.edit = async (req, res) => {
    let id = req.params.id
    let data = req.body
    let result = joi.validate(data, model)
    if (result.error) {
      res.status(400).json(result.error).end()
    }
    else {
      try {
        let user = await all("SELECT email,nick FROM users WHERE id = ?", [id])
        if (data.email ==  user[0].email) {
          if (data.nick == user[0].nick) {
            db.run("UPDATE users SET name = ?, nick = ?, email = ?, password = ? WHERE id = ?", [data.name, data.nick, data.email, data.password, id], (err, result) => {
              if (err) {
                res.status(500).json({ "Message": "Server Error" }).end()
              }
              else {
                res.status(200).json({ "Message": "User updated successful" }).end()
              }
            })
          }
          else {
            let nick = await all("SELECT nick FROM users WHERE nick = ?", [data.nick])
            if (nick.length == 0) {
              db.run("UPDATE users SET name = ?, nick = ?, email = ?, password = ? WHERE id = ?", [data.name, data.nick, data.email, data.password, id], (err, result) => {
                if (err) {
                  res.status(500).json({ "Message": "Server Error" }).end()
                }
                else {
                  res.status(200).json({ "Message": "User updated successful" }).end()
                }
              })                
            }
            else {
              res.status(409).json({ "Message": "Nick already exists" }).end()
            }
          }
        }
        else {
          let email = await all("SELECT email FROM users WHERE email = ?", [data.email])
          if (email.length == 0) {           
            if (data.nick == user[0].nick) {
              db.run("UPDATE users SET name = ?, nick = ?, email = ?, password = ? WHERE id = ?", [data.name, data.nick, data.email, data.password, id], (err, result) => {
                if (err) {
                  res.status(500).json({ "Message": "Server Error" }).end()
                }
                else {
                  res.status(200).json({ "Message": "User updated successful" }).end()
                }
              })
            }
            else {
              let nick = await all("SELECT nick FROM users WHERE nick = ?", [data.nick])
              if (nick.length == 0) {
                db.run("UPDATE users SET name = ?, nick = ?, email = ?, password = ? WHERE id = ?", [data.name, data.nick, data.email, data.password, id], (err, result) => {
                  if (err) {
                    res.status(500).json({ "Message": "Server Error" }).end()
                  }
                  else {
                    res.status(200).json({ "Message": "User updated successful" }).end()
                  }
                })                
              }
              else {
                res.status(409).json({ "Message": "Nick already exists" }).end()
              }
            }            
          }
          else {
            res.status(409).json({ "Message": "Email already exists" }).end()
          }          
        }
      } catch (error) {
        res.status(500).json({ "Message": "Server Error" }).end()
      }
    }
  }

  user.delete = (req, res) => {
    let id = req.params.id
    db.run("DELETE FROM users WHERE id = ?", [id], (err, result) => {
      if (err) {
        res.status(500).json(err).end()
      }
      else {
        res.status(200).json({ "Message": "User removed successful" }).end()
      }
    })
  }

  return user
}
