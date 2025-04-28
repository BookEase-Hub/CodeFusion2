const Joi = require('joi');

// User validation schemas
const userSchema = Joi.object({
  name: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// File validation schema
const fileSchema = Joi.object({
  name: Joi.string().required(),
  projectId: Joi.string().required(),
  content: Joi.string().allow(''),
  language: Joi.string().default('plaintext')
});

// Middleware to validate request body
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details.map(d => d.message)
    });
  }
  next();
};

module.exports = {
  validateUser: validate(userSchema),
  validateLogin: validate(loginSchema),
  validateFile: validate(fileSchema)
};