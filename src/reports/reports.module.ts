import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ScoringService } from '../scoring/scoring.service';
import { TraceMapsModule } from '../trace-maps/trace-maps.module';
import { GlossaryModule } from '../glossary/glossary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Report]), TraceMapsModule, GlossaryModule],
  providers: [ReportsService, ScoringService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
