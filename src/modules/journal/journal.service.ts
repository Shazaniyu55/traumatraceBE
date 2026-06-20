import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from '../core/entities/journal-entry.entity';
import { ReflectionResponse } from './reflection-response.entity';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(JournalEntry) private readonly journal: Repository<JournalEntry>,
    @InjectRepository(ReflectionResponse) private readonly reflections: Repository<ReflectionResponse>,
  ) {}

  // --- Free writing ---
  listEntries(userId: string) {
    return this.journal.find({
      where: { user_id: userId },
      order: { pinned: 'DESC', updatedAt: 'DESC' },
    });
  }

  createEntry(userId: string, data: { title?: string; body: string }) {
    return this.journal.save(this.journal.create({ user_id: userId, ...data }));
  }

  async updateEntry(userId: string, id: string, data: Partial<JournalEntry>) {
    const entry = await this.journal.findOne({ where: { id, user_id: userId } });
    if (!entry) throw new NotFoundException();
    Object.assign(entry, data);
    return this.journal.save(entry);
  }

  async deleteEntry(userId: string, id: string) {
    await this.journal.delete({ id, user_id: userId });
    return { ok: true };
  }

  // --- Reflection history ---
  listReflections(userId: string) {
    return this.reflections.find({
      where: { user_id: userId },
      order: { createdAt: 'DESC' },
    });
  }

  saveReflection(
    userId: string,
    data: { promptKey: string; prompt: string; response: string },
  ) {
    return this.reflections.save(this.reflections.create({ user_id: userId, ...data }));
  }
}
