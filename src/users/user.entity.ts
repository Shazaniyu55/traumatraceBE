import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Report } from '../reports/report.entity';
import { JournalEntry } from '../journal/journal-entry.entity';
import { ReflectionResponse } from '../journal/reflection-response.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  firebaseUid: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  displayName: string;

  // Firebase Cloud Messaging token for push notifications.
  @Column({ nullable: true })
  fcmToken: string;

  @OneToMany(() => Report, (r) => r.user)
  reports: Report[];

  @OneToMany(() => JournalEntry, (j) => j.user)
  journalEntries: JournalEntry[];

  @OneToMany(() => ReflectionResponse, (r) => r.user)
  reflectionResponses: ReflectionResponse[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
