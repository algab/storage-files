module.exports = (app) => {
   var joi = app.get("joi")

   const login = {
     email: joi.string().required(),
     password: joi.string().required()
   }

   return login
}
