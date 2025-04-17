import { PrismaClient } from '@prisma/client';
import { User } from '../domain/user.entity';
import type { IUserRepository } from '../domain/user-repository';
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userData: Omit<User, 'id'>): Promise<User> {
    const result = await this.prisma.user.create({
      data: userData
    });
    
    return this.mapToEntity(result);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.prisma.user.findUnique({
      where: { email }
    });
    
    return result ? this.mapToEntity(result) : null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.prisma.user.findUnique({
      where: { id }
    });
    
    return result ? this.mapToEntity(result) : null;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const result = await this.prisma.user.update({
      where: { id },
      data: userData
    });
    
    return this.mapToEntity(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    });
  }

  private mapToEntity(data: any): User {
    return new User(
      data.id,
      data.email,
      data.password,
      data.name,
      data.role
    );
  }
}