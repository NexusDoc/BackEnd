import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User } from '../entities/users.entity';

@Injectable()
export class ResetCleanerTask {
  private readonly logger = new Logger(ResetCleanerTask.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanExpiredResetCodes() {
    const now = new Date();

    const expiredUsers = await this.userRepository.find({
      where: {
        resetCodeExpires: LessThan(now),
      },
    });

    if (expiredUsers.length === 0) return;

    for (const user of expiredUsers) {
      user.resetCode = null;
      user.resetCodeExpires = null;
      await this.userRepository.save(user);
    }

    this.logger.log(
      `Limpados ${expiredUsers.length} códigos de reset expirados.`
    );
  }
}