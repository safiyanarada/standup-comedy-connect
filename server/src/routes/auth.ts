import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { register, login, getProfile } from '../controllers/auth';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema } from '../validation/schemas';

const router = Router();

// Async handler wrapper that returns an Express RequestHandler
const asyncHandler = (fn: (req: Request | AuthRequest, res: Response) => Promise<any>): RequestHandler => {
  return async (req: Request | AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res);
      return; // Explicitly return void
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