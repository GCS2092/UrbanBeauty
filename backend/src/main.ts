import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
