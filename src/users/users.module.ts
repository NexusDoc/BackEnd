import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { UsersController } from './controller/users.controller';
import { UsersService } from './services/users.services';
import { ResetCleanerTask } from './tasks/reset-cleaner.task';
import { MailModule } from './mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailModule,
  ],
  providers: [
    UsersService,
    ResetCleanerTask,
  ],
  controllers: [UsersController],
})
export class UsersModule {}