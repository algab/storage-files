module.exports = (app) => {
  var joi = app.get("joi")

  const user = {
    name: joi.string().required(),
    nick: joi.string().regex(/^[a-z,0-9]+$/).required(),
    email: joi.string().email().required(),
    password: joi.string().required()
  }

  return user
}
