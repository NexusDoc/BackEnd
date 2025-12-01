import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT') || 5000; // pega do env ou default 5000

  await app.listen(port, '127.0.0.1'); // roda apenas no localhost

  console.log(`Servidor rodando na porta ${port}`);
  console.log(`Ambiente atual: ${configService.get('NODE_ENV') || 'development'}`);
}

bootstrap();