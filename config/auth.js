var passport = require("passport")
var http = require("passport-http")
var httpBearer = require("passport-http-bearer").Strategy
const util = require("util")
const db = require("./database")

var all = util.promisify(db.all).bind(db)

passport.use("admin", new http.DigestStrategy({ qop: "auth" },
  function (username,done) {
    if (username == "admin") {
      return done(null,"admin","1234")
    } else {
      return done(null,false)      
    }    
  }
))

passport.use("bearer", new httpBearer(
  async function (token, done) {
    try {
      let result = await all("SELECT * FROM users WHERE token = ?", [token])
      if (result.length == 0) {
        return done(null, false)
      } else {
        return done(null, true)
      }
    } catch (error) {
      return done(null, false)
    }
  }
))

module.exports = passport
