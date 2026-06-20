import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { TherapistsService } from './therapists.service';
import { ContactTherapistDto } from './dto/contact.dto';
import { RegisterTherapistDto } from './dto/register.dto';


const DEFAULT_RADIUS_KM = 10;
const MAX_RADIUS_KM = 200;

@Controller('therapists')
export class TherapistsController {
  constructor(private readonly therapists: TherapistsService) {}

  // Public-facing directory used by Resources > Find Support.
  @Get()
  @UseGuards(FirebaseAuthGuard)
  list(@Query('city') city?: string) {
    return this.therapists.listVerified(city);
  }

  /**
   * Location-based search.
   * GET /therapists/nearby?lat=6.45&lng=3.39&radius=15   (radius in km)
   *
   * Query params are parsed manually because the global ValidationPipe is not
   * configured with `transform: true`, so a DTO would not coerce the strings.
   */
  @Get('nearby')
  @UseGuards(FirebaseAuthGuard)
  nearby(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
  ) {
    const latitude = Number(lat);
    const longitude = Number(lng);
    const radiusKm = radius != null && radius !== '' ? Number(radius) : DEFAULT_RADIUS_KM;

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new BadRequestException('lat and lng are required numeric query params');
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new BadRequestException('lat/lng out of range');
    }
    if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > MAX_RADIUS_KM) {
      throw new BadRequestException(`radius must be a positive number up to ${MAX_RADIUS_KM} km`);
    }

    return this.therapists.findNearby(latitude, longitude, radiusKm);
  }

  // Contact a therapist by email (reply-to is set to the user's email).
  @Post(':id/contact')
  @UseGuards(FirebaseAuthGuard)
  contact(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: ContactTherapistDto,
  ) {
    return this.therapists.contact(id, dto, req.user);
  }

  // Open registration endpoint for therapists to join the directory.
  @Post('register')
  register(@Body() body: RegisterTherapistDto) {
    return this.therapists.register(body);
  }
}