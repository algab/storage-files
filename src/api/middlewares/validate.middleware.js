const validate = (schema) => ({ body }, res, next) => {
  const result = schema.validate(body);
  if (result.error) {
    res.status(400).json(result.error.details).end();
  } else {
    next();
  }
};

module.exports = validate;
