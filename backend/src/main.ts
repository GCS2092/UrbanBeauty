import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    // Set global prefix for all routes (except root routes)
    app.setGlobalPrefix('api', {
      exclude: ['/', '/health', '/test-db'],
    });
    
    // Enable CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    });
    
    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    
    logger.log(`🚀 Server running on port ${port}`);
    logger.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
    
    // Log database connection status
    if (process.env.DATABASE_URL) {
      logger.log('✅ DATABASE_URL is configured');
    } else {
      logger.warn('⚠️ DATABASE_URL is not configured');
    }
  } catch (error) {
    logger.error('❌ Failed to start application', error);
    // Log stack trace for debugging
    if (error instanceof Error) {
      logger.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}
bootstrap();
