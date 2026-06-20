import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalEntry } from '../core/entities/journal-entry.entity';
import { ReflectionResponse } from './reflection-response.entity';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntry, ReflectionResponse])],
  providers: [JournalService],
  controllers: [JournalController],
})
export class JournalModule {}
