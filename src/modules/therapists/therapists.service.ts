import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Therapist } from '../core/entities/therapist.entity';

@Injectable()
export class TherapistsService {
  constructor(
    @InjectRepository(Therapist) private readonly repo: Repository<Therapist>,
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

  // Self-registration — created unverified, pending admin approval.
  register(data: Partial<Therapist>) {
    return this.repo.save(this.repo.create({ ...data, verified: false }));
  }
}
