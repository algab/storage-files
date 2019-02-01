const joi = require("joi")

module.exports = (app) => {
  let user = {}
  
  user = {
    name: joi.string().required(),
    state: joi.string().max(2).required(),
    city: joi.string().required(),
    nick: joi.string().regex(/^[a-z,0-9]+$/).required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required()
  }

  return user
}
