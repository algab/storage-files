var passport = require("passport")
var http = require("passport-http")
const util = require("util")
const db = require("./database")

var all = util.promisify(db.all).bind(db)

passport.use("digest",new http.DigestStrategy({qop:"auth"},
   async function (username,done) {
     let result = await all("SELECT * FROM users WHERE nick = ?",[username])
     if (result.length==0) {
       return done(null,false)
     }
     else {
       return done(null,result[0].nick,result[0].password)
     }
   }
))

passport.use("admin",new http.DigestStrategy({qop:"auth2"},
  async function (username,done) {
    if (username=="admin") {
      return done(null,"admin","1234")
    }
    else {
      return done(null,false)
    }
  }
))

module.exports = passport
