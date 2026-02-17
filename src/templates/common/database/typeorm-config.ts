import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres', // Default to postgres
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'node_craft',
  synchronize: true, // Only for development
  logging: false,
  entities: [__dirname + '/../models/*.entity.ts'],
  migrations: [],
  subscribers: [],
});

export default AppDataSource;
