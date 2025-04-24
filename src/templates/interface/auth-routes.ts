import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validation.middleware';
import { LoginSchema , UserSchema } from '../../../application/dtos/user-dtos';
import { container } from '../../../infrastructure/container';

const router = Router();
const authController = container.resolve(AuthController);

router.post(
  '/register', 
  validate(UserSchema), 
  authController.register.bind(authController)
);

router.post(
  '/login', 
  validate(LoginSchema), 
  authController.login.bind(authController)
);

router.get(
  '/me', 
  authenticate, 
  authController.me.bind(authController)
);

export default router;