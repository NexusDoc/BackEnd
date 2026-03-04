import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita validação global 💥
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // remove campos extras
      forbidNonWhitelisted: true, // impede campos não permitidos
      transform: true,            // transforma automaticamente tipos
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT') || 5000;

  await app.listen(port, '0.0.0.0');

  console.log(`Servidor rodando na porta ${port}`);
  console.log(`Ambiente atual: ${configService.get('NODE_ENV') || 'development'}`);
}

bootstrap();