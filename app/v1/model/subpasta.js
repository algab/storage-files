module.exports = (app) => {
   var joi = app.get("joi")

   const subpasta = {
      nomePasta : joi.string().regex(/^[a-z]+$/).required(),
      nomeSubpasta : joi.string().regex(/^[a-z]+$/).required()
   }

   return subpasta
}
