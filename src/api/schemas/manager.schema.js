const joi = require('joi');

const manager = joi.object({
  name: joi.string().max(100).required(),
  email: joi.string().email().required(),
  password: joi.string().min(8).max(20),
});

module.exports = manager;
