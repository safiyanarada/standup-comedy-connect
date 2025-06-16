import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    } else {
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
  }
}; 