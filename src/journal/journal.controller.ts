import {
  Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { JournalService } from './journal.service';

@Controller()
@UseGuards(FirebaseAuthGuard)
export class JournalController {
  constructor(private readonly journal: JournalService) {}

  @Get('journal')
  list(@Req() req) {
    return this.journal.listEntries(req.user.id);
  }

  @Post('journal')
  create(@Req() req, @Body() body: { title?: string; body: string }) {
    return this.journal.createEntry(req.user.id, body);
  }

  @Patch('journal/:id')
  update(@Req() req, @Param('id') id: string, @Body() body: any) {
    return this.journal.updateEntry(req.user.id, id, body);
  }

  @Delete('journal/:id')
  remove(@Req() req, @Param('id') id: string) {
    return this.journal.deleteEntry(req.user.id, id);
  }

  @Get('reflections')
  reflections(@Req() req) {
    return this.journal.listReflections(req.user.id);
  }

  @Post('reflections')
  saveReflection(
    @Req() req,
    @Body() body: { promptKey: string; prompt: string; response: string },
  ) {
    return this.journal.saveReflection(req.user.id, body);
  }
}
