import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { AssessmentsService } from './assessments.service';
import { ReportsService } from '../reports/reports.service';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';

@Controller('assessments')
@UseGuards(FirebaseAuthGuard)
export class AssessmentsController {
  constructor(
    private readonly assessments: AssessmentsService,
    private readonly reports: ReportsService,
  ) {}

  // GET the questions to render the Explore Myself flow.
  @Get('content')
  content() {
    return this.assessments.getContent();
  }

  // POST answers -> runs the scoring engine -> returns the generated report.
  @Post('submit')
  submit(@Req() req, @Body() dto: SubmitAssessmentDto) {
    return this.reports.generate(req.user.id, dto);
  }
}
