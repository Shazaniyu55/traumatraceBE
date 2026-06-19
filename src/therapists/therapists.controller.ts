import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { TherapistsService } from './therapists.service';

@Controller('therapists')
export class TherapistsController {
  constructor(private readonly therapists: TherapistsService) {}

  // Public-facing directory used by Resources > Find Support.
  @Get()
  @UseGuards(FirebaseAuthGuard)
  list(@Query('city') city?: string) {
    return this.therapists.listVerified(city);
  }

  // Open registration endpoint for therapists to join the directory.
  @Post('register')
  register(@Body() body: any) {
    return this.therapists.register(body);
  }
}
