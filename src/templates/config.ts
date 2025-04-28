import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface Config {
  server: {
    port: number;
    env: string;
    cors: {
      origin: string[];
      methods: string[];
    };
  };
  database: {
    url: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
  };
  logging: {
    level: string;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    }
  },
  database: {
    url: process.env.DATABASE_URL || ''
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

export default config;