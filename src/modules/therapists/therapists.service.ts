import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Therapist } from '../core/entities/therapist.entity';
import { GoogleMapsService } from '../../modules/googlemap/maps.service';
import { MailService } from '../../modules/mail/mail.service';
import { RegisterTherapistDto } from './dto/register.dto';
import { ContactTherapistDto } from './dto/contact.dto';


// A therapist row plus the computed distance from the search point.
export type TherapistWithDistance = Therapist & { distanceKm: number };

@Injectable()
export class TherapistsService {
  // Haversine great-circle distance (km) between the search point (:lat,:lng)
  // and each therapist row. LEAST/GREATEST clamps the value into [-1, 1] to
  // avoid acos() domain errors from floating-point drift.
  private static readonly DISTANCE_KM_SQL = `(
    6371 * acos(
      LEAST(1, GREATEST(-1,
        cos(radians(:lat)) * cos(radians(t.latitude)) *
        cos(radians(t.longitude) - radians(:lng)) +
        sin(radians(:lat)) * sin(radians(t.latitude))
      ))
    )
  )`;

  constructor(
    @InjectRepository(Therapist) private readonly repo: Repository<Therapist>,
    private readonly maps: GoogleMapsService,
    private readonly mail: MailService,
  ) {}

  // Public directory — only verified therapists are listed (Find Support).
  listVerified(city?: string) {
    const qb = this.repo
      .createQueryBuilder('t')
      .where('t.verified = :v', { v: true })
      .orderBy('t.fullName', 'ASC');
    if (city) qb.andWhere('LOWER(t.city) = LOWER(:city)', { city });
    return qb.getMany();
  }

  /**
   * Find verified therapists within `radiusKm` of (lat, lng), nearest first.
   * Rows without coordinates are excluded.
   */
  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<TherapistWithDistance[]> {
    const distance = TherapistsService.DISTANCE_KM_SQL;

    const qb = this.repo
      .createQueryBuilder('t')
      .where('t.verified = :v', { v: true })
      .andWhere('t.latitude IS NOT NULL')
      .andWhere('t.longitude IS NOT NULL')
      .addSelect(distance, 'distance_km')
      .andWhere(`${distance} <= :radius`)
      .orderBy('distance_km', 'ASC')
      .setParameters({ lat, lng, radius: radiusKm });

    const { entities, raw } = await qb.getRawAndEntities();

    return entities.map((t, i) => ({
      ...t,
      distanceKm: Math.round(Number(raw[i].distance_km) * 10) / 10,
    }));
  }

  /**
   * Self-registration — created unverified, pending admin approval.
   * If coordinates aren't supplied, attempts to geocode the address.
   */
  async register(dto: RegisterTherapistDto): Promise<Therapist> {
    let { latitude, longitude } = dto;

    if (latitude == null || longitude == null) {
      const address = [dto.addressLine, dto.city, dto.country]
        .filter(Boolean)
        .join(', ');
      const geo = await this.maps.geocode(address);
      if (geo) {
        latitude = geo.lat;
        longitude = geo.lng;
      }
    }

    const therapist = this.repo.create({
      ...dto,
      latitude,
      longitude,
      verified: false,
    });
    return this.repo.save(therapist);
  }

  /**
   * Sends the authenticated user's message to a therapist by email.
   * `user` is the request.user attached by FirebaseAuthGuard.
   */
  async contact(
    therapistId: string,
    dto: ContactTherapistDto,
    user: { displayName?: string; email?: string },
  ): Promise<{ ok: true }> {
    const therapist = await this.repo.findOne({ where: { id: therapistId } });
    if (!therapist) throw new NotFoundException('Therapist not found');

    await this.mail.sendTherapistContact({
      to: therapist.email,
      therapistName: therapist.fullName,
      fromName: dto.fromName ?? user?.displayName ?? 'A TraumaTrace user',
      fromEmail: dto.fromEmail ?? user?.email,
      message: dto.message,
    });

    return { ok: true };
  }
}