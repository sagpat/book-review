import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/book-review-microservice';
    
    await mongoose.connect(mongoUri);
    
    logger.info('📦 Connected to MongoDB database');
  } catch (error) {
    logger.warn('⚠️ Database connection failed - running without MongoDB:', error);
    // Don't throw error to allow development without MongoDB
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('📦 Disconnected from MongoDB database');
  } catch (error) {
    logger.error('❌ Database disconnection failed:', error);
    throw error;
  }
};