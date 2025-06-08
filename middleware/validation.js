import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors
      });
    }
    
    next();
  };
};

// Validation schemas
export const authSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

export const patientSchemas = {
  create: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    dateOfBirth: Joi.date().max('now').required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    address: Joi.string().optional(),
    medicalHistory: Joi.string().optional(),
    emergencyContact: Joi.string().optional()
  }),
  
  update: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    address: Joi.string().optional(),
    medicalHistory: Joi.string().optional(),
    emergencyContact: Joi.string().optional()
  })
};

export const doctorSchemas = {
  create: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    specialization: Joi.string().required(),
    licenseNumber: Joi.string().required(),
    experience: Joi.number().integer().min(0).max(50).required(),
    qualification: Joi.string().required(),
    department: Joi.string().required(),
    consultationFee: Joi.number().positive().required(),
    availability: Joi.object().optional()
  }),
  
  update: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    specialization: Joi.string().optional(),
    licenseNumber: Joi.string().optional(),
    experience: Joi.number().integer().min(0).max(50).optional(),
    qualification: Joi.string().optional(),
    department: Joi.string().optional(),
    consultationFee: Joi.number().positive().optional(),
    availability: Joi.object().optional()
  })
};

export const mappingSchemas = {
  create: Joi.object({
    patientId: Joi.string().uuid().required(),
    doctorId: Joi.string().uuid().required(),
    notes: Joi.string().optional()
  })
};