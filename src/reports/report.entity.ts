import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;

  // Raw assessment answers (stressors, coping, childhood) — stored for the
  // user's own record and to allow regeneration. Childhood NUMERIC score is
  // intentionally NOT persisted in a user-facing field.
  @Column('jsonb')
  assessmentInput: Record<string, unknown>;

  // The rendered report payload the app displays (sections A-F + trace maps).
  @Column('jsonb')
  reportPayload: Record<string, unknown>;

  // Internal tier ('gentle' | 'clear' | 'high') for analytics. Not the number.
  @Column()
  childhoodTier: string;

  @CreateDateColumn()
  createdAt: Date;
}
