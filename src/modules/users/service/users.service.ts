import { Injectable } from '@nestjs/common';
import { UserRepository } from '@adapters/repository/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(data: { firebaseUid: string; email?: string; displayName?: string }){
    await this.userRepository.createUser(data)
  }
async upsertFromFirebase(data: {
  firebaseUid: string;
  email?: string;
  displayName?: string;
}) {
  return this.userRepository.upsertFromFirebase(data);
}

async setFcmToken(userId: string, fcmToken: string): Promise<void> {
  await this.userRepository.updateUser(userId, { fcmToken });
}

  findById(id: string) {
    return this.userRepository.findUserById(id);
  }
}
