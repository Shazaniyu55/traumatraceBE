import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { GlossaryTerm } from '../core/entities/glossary-term.entity';

@Injectable()
export class GlossaryService {
  constructor(
    @InjectRepository(GlossaryTerm) private readonly repo: Repository<GlossaryTerm>,
  ) {}

  search(q?: string) {
    if (!q) return this.repo.find({ order: { term: 'ASC' } });
    return this.repo.find({
      where: [{ term: ILike(`%${q}%`) }, { definition: ILike(`%${q}%`) }],
      order: { term: 'ASC' },
    });
  }

  findByIds(ids: string[]) {
    if (!ids.length) return Promise.resolve([] as GlossaryTerm[]);
    return this.repo.find({ where: { id: In(ids) } });
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
