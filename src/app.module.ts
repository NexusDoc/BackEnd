import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database';
import databaseConfig from './config/db'; // <-- importar aqui

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig], // <-- carregar o config do database
      envFilePath: process.env.NODE_ENV === 'production' 
        ? '.env.production'
        : '.env.development',
    }),
    DatabaseModule,
  ],
})
export class AppModule {}