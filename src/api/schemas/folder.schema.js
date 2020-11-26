const joi = require('joi');

const folder = joi.object({
  bucket: joi
    .string()
    .regex(/^[a-z,0-9]+$/)
    .required(),
  folder: joi
    .string()
    .regex(/^[a-z,0-9]+$/)
    .required(),
});

module.exports = folder;
