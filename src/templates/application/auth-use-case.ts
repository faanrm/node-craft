import { User } from '../domain/user.entity';
import type { IUserRepository } from '../domain/user-repository';
import  type { CreateUserDTO , LoginDTO } from './user-dtos';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthUseCase {
  constructor(private userRepository: IUserRepository) {}

  async register(userData: CreateUserDTO): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    const hashedPassword = await this.hashPassword(userData.password);
    
    return this.userRepository.create({
      email: userData.email,
      password: hashedPassword,
      name: userData.name || null,
      role: userData.role || 'user'
    });
  }

  async login(credentials: LoginDTO): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmail(credentials.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const isPasswordValid = await this.comparePassword(credentials.password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    const token = this.generateToken(user);
    
    return {
      user,
      token
    };
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
  
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  private generateToken(user: User): string {
    const jwtSecret = process.env.JWT_SECRET as string;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );
  }
}