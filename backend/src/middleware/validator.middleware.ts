import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.error('=== VALIDATION ERRORS ===');
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    console.error('Validation errors:', JSON.stringify(errors.array(), null, 2));

    const formattedErrors = errors.array().map((error: any) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    return next(new ValidationError('Validation failed', formattedErrors, 'VALIDATION_ERROR'));
  }

  next();
};
