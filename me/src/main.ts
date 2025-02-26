import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS
  app.enableCors({
    origin: 'http://localhost:5173', // Vite默认端口
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  });
  await app.listen(3000);
}
bootstrap();
