import { responseHandler } from '../utils/responseHandler.js';

/**
 * Validates request data against a custom schema or validation function.
 * @param {Function} validatorFunc - Function that takes req.body and returns { errors: string[] | null }
 */
export const validationMiddleware = (validatorFunc) => {
  return (req, res, next) => {
    const { errors, value } = validatorFunc(req.body);
    
    if (errors && errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};
