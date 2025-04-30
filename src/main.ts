import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // ✅ FIX: Import AppModule
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe()); // enable global validation

  await app.listen(3000);
}
bootstrap();
