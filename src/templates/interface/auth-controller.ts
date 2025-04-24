import { Request, Response } from 'express';
import { AuthUseCase } from '../../../application/use-cases/auth-use-case';
import  type { CreateUserDTO , LoginDTO } from '../../../application/dtos/user-dtos';

export class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.authUseCase.register(req.body as CreateUserDTO);
      
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        res.status(409).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.authUseCase.login(req.body as LoginDTO);
      
      res.status(200).json({
        message: 'Login successful',
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role
        }
      });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const user = await this.authUseCase.getUserById(req.user.id);
      
      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}