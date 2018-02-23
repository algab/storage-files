module.exports = (app) => {
   var joi = app.get("joi")

   const user = {
     nameUser : joi.string().required(),
     email : joi.string().required(),
     password : joi.string().required()
   }

   return user
}
