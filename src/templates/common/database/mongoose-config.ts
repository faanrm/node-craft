import mongoose from 'mongoose';
import { logger } from './logger';
import config from './config';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.database.url || 'mongodb://localhost:27017/nodecraft');
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
