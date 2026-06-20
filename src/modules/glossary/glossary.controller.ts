import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { GlossaryService } from './glossary.service';

@Controller('glossary')
@UseGuards(FirebaseAuthGuard)
export class GlossaryController {
  constructor(private readonly glossary: GlossaryService) {}

  @Get()
  list(@Query('q') q?: string) {
    return this.glossary.search(q);
  }

  @Get(':id')
  one(@Param('id') id: string) {
    return this.glossary.findOne(id);
  }
}
