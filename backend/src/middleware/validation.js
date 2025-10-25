const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }
    next();
  };
};

const schemas = {
  register: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required()
  }),
  
  notebook: Joi.object({
    name: Joi.string().max(100).required(),
    pages: Joi.array().items(Joi.object({
      drawings: Joi.array(),
      text: Joi.string().allow(''),
      pageNumber: Joi.number().required()
    }))
  }),
  
  note: Joi.object({
    title: Joi.string().max(200).required(),
    content: Joi.string().max(10000).required(),
    tags: Joi.array().items(Joi.string())
  })
};

module.exports = { validate, schemas };