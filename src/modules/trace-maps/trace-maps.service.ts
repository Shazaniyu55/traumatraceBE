import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TraceMap } from '../core/entities/trace-map.entity';

@Injectable()
export class TraceMapsService {
  constructor(
    @InjectRepository(TraceMap) private readonly repo: Repository<TraceMap>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findByIds(ids: string[]) {
    if (!ids.length) return Promise.resolve([] as TraceMap[]);
    return this.repo.find({ where: { id: In(ids) } });
  }
}
