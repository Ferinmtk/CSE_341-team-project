const { body, param, validationResult } = require('express-validator');

const studentValidationRules = () => {
  return [
    body('firstName').optional().notEmpty().withMessage('First name is required'),
    body('lastName').optional().notEmpty().withMessage('Last name is required'),
    body('gender').optional().notEmpty().withMessage('Gender is required'),
    body('age').optional().isInt({ min: 1 }).withMessage('Age must be a positive integer'),
    body('favoriteSubject').optional().notEmpty().withMessage('Favorite subject is required'),
    body('grade').optional().notEmpty().withMessage('Grade is required'),
    body('email').optional().isEmail().withMessage('Email is invalid'),
    param('id').optional().isMongoId().withMessage('Invalid student ID')
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const firstError = errors.array()[0].msg; // Extract the first error message
  return res.status(400).json({ errors: firstError });
};

module.exports = {
  studentValidationRules,
  validate,
};