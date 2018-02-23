var passport = require("passport")
var http = require("passport-http")
const util = require("util")
const db = require("./database")

var all = util.promisify(db.all).bind(db)

passport.use(new http.DigestStrategy({qop:"auth"},
   async function (username,done) {
     let result = await all("SELECT * FROM users WHERE email = ?",[username])
     if (result.length==0) {
       return done(null,false)
     }
     else {
       return done(null,result[0].email,result[0].password)
     }
   }
))

module.exports = passport
