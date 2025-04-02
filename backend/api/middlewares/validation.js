const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array()
    });
  }
  next();
};

const dropValidationRules = [
  {
    field: 'title',
    rules: ['notEmpty', 'isLength:3,100']
  },
  {
    field: 'description',
    rules: ['notEmpty', 'isLength:10,1000']
  },
  {
    field: 'startDate',
    rules: ['notEmpty', 'isISO8601']
  },
  {
    field: 'endDate',
    rules: ['notEmpty', 'isISO8601']
  },
  {
    field: 'maxConcurrentUsers',
    rules: ['notEmpty', 'isInt:1,1000']
  },
  {
    field: 'products',
    rules: ['notEmpty', 'isArray:1,50']
  }
];

const queueValidationRules = [
  {
    field: 'maxConcurrentUsers',
    rules: ['notEmpty', 'isInt:1,1000']
  }
];

const cartReservationValidationRules = [
  {
    field: 'products',
    rules: ['notEmpty', 'isArray:1,10']
  }
];

module.exports = {
  validate,
  dropValidationRules,
  queueValidationRules,
  cartReservationValidationRules
}; 