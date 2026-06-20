import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Report } from './entities/report.entity';
import { TraceMap } from './entities/trace-map.entity';
import { GlossaryTerm } from './entities/glossary-term.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { ReflectionResponse } from '../journal/reflection-response.entity';
import { Therapist } from './entities/therapist.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User, Report, TraceMap, GlossaryTerm, JournalEntry, ReflectionResponse, Therapist])],
  providers: [],
  exports: [
    // Repositories
    // Services
    // UseCases
  ],
})
export class CoreModule {}
