import { Module } from '@nestjs/common';
import { MailService } from './services/mail.services';

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}