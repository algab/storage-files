module.exports = (app) => {
   var joi = app.get("joi")

   const pasta = {
      nomePasta : joi.string().regex(/^[a-z]+$/).required(),
      idUsuario : joi.string().required()
   }

   return pasta
}
