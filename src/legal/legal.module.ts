import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; 
import { LegalController } from './controller/legal.controller';
import { LegalService } from './services/legal.service';
import { DocumentSearch } from './entities/DocumentSearch.entity';
import { User } from '../users/entities/users.entity';
import { Process } from './entities/process.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentSearch, Process, User]),
    ConfigModule, 
  ],
  controllers: [LegalController],
  providers: [LegalService],
  exports: [LegalService],
})
// O TS reclama se o nome aqui for diferente de 'LegalModule'
export class LegalModule {}