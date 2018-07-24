module.exports = (app) => {
  var joi = app.get("joi")

  const user = {
    name: joi.string().required(),
    birthday: joi.string().required(),
    sexo: joi.string().required(),
    nick: joi.string().regex(/^[a-z]+$/).required(),
    email: joi.string().required(),
    password: joi.string().required()
  }

  return user
}
