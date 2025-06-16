import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema } from '../validation/schemas';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Async handler wrapper
const asyncHandler = (fn: (req: Request | AuthRequest, res: Response) => Promise<Response | void>) => {
  return async (req: Request | AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };
};

// Routes publiques
router.post('/register', validate(registerSchema), asyncHandler(register));
router.post('/login', validate(loginSchema), asyncHandler(login));

// Routes protégées
router.get('/profile', authMiddleware, asyncHandler(getProfile));

export default router; 