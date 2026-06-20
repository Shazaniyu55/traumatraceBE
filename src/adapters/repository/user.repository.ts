import { User } from '@modules/core/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {
    super(userRepo.target, userRepo.manager, userRepo.queryRunner);
  }

  async createUser(
    dto: Partial<User>,
    entityManager?: EntityManager,
  ): Promise<User> {
    const manager = entityManager ?? this.entityManager;
    const user = manager.create(User, dto);
    return manager.save(User, user);
  }

  async findUserById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  }


async upsertFromFirebase(
  data: { firebaseUid: string; email?: string; displayName?: string },
  entityManager?: EntityManager,
): Promise<User> {
  const manager = entityManager ?? this.entityManager;

  let user = await manager.findOne(User, {
    where: { firebaseUid: data.firebaseUid },
  });

  if (!user) {
    user = manager.create(User, data);
  } else {
    user.email = data.email ?? user.email;
    user.displayName = data.displayName ?? user.displayName;
  }

  return manager.save(User, user);
}

async updateUser(
  id: string,
  dto: Partial<User>,
  entityManager?: EntityManager,
): Promise<void> {
  const manager = entityManager ?? this.entityManager;
  await manager.update(User, id, dto);
}
}