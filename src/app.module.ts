import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/db';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development',
    }),

    DatabaseModule,
    UsersModule,   // <-- ESTE CARA PRECISA ESTAR AQUI
  ],
})
export class AppModule {}