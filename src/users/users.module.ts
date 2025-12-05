import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { UsersController } from './controller/users.controller';
import { UsersService } from './services/users.services';
import { ResetCleanerTask } from './tasks/reset-cleaner.task';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // OK
  ],
  providers: [
    UsersService,
    ResetCleanerTask, // OK
  ],
  controllers: [UsersController],
})
export class UsersModule {}