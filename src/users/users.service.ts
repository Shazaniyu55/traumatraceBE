import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async upsertFromFirebase(data: {
    firebaseUid: string;
    email?: string;
    displayName?: string;
  }): Promise<User> {
    let user = await this.repo.findOne({ where: { firebaseUid: data.firebaseUid } });
    if (!user) {
      user = this.repo.create(data);
    } else {
      user.email = data.email ?? user.email;
      user.displayName = data.displayName ?? user.displayName;
    }
    return this.repo.save(user);
  }

  async setFcmToken(userId: string, fcmToken: string): Promise<void> {
    await this.repo.update({ id: userId }, { fcmToken });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
