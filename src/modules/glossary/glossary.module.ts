import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlossaryTerm } from '../core/entities/glossary-term.entity';
import { GlossaryService } from './glossary.service';
import { GlossaryController } from './glossary.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GlossaryTerm])],
  providers: [GlossaryService],
  controllers: [GlossaryController],
  exports: [GlossaryService],
})
export class GlossaryModule {}
