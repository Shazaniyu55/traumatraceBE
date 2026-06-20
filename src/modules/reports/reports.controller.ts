import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(FirebaseAuthGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  // Progress > My Reports
  @Get()
  list(@Req() req) {
    return this.reports.findForUser(req.user.id);
  }

  @Get(':id')
  one(@Req() req, @Param('id') id: string) {
    return this.reports.findOne(req.user.id, id);
  }
}
