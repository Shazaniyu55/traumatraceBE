import { Module } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AssessmentsController } from './assessments.controller';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [ReportsModule],
  providers: [AssessmentsService],
  controllers: [AssessmentsController],
})
export class AssessmentsModule {}
