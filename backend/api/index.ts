import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { execSync } from 'child_process';

const logger = new Logger('VercelHandler');

let cachedApp: any;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    // Run migrations in production
    if (process.env.NODE_ENV === 'production') {
      try {
        logger.log('🔄 Running database migrations...');
        execSync('npx prisma migrate deploy', {
          stdio: 'inherit',
          env: process.env,
        });
        logger.log('✅ Database migrations applied successfully');
      } catch (error) {
        logger.warn('⚠️ Failed to run migrations (this is OK if migrations are already applied)');
      }
    }

    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
      logger: ['error', 'warn', 'log'],
    });

    // Set global prefix
    app.setGlobalPrefix('api', {
      exclude: ['/', '/health', '/test-db'],
    });

    // Enable CORS
    const corsOrigin = process.env.CORS_ORIGIN;
    const allowedOrigins = corsOrigin 
      ? corsOrigin.split(',').map(origin => origin.trim())
      : ['*'];
    
    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // If CORS_ORIGIN is '*', allow all origins
        if (allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        // For development, allow localhost
        if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
          return callback(null, true);
        }
        
        // Default: allow the request (but log a warning)
        logger.warn(`⚠️ CORS: Origin ${origin} not in allowed list: ${allowedOrigins.join(', ')}`);
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    cachedApp = expressApp;
    return expressApp;
  } catch (error) {
    logger.error('❌ Failed to create app', error);
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  const app = await createApp();
  return app(req, res);
}
