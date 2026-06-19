import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('reflection_responses')
export class ReflectionResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.reflectionResponses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;

  @Column()
  promptKey: string;

  @Column('text')
  prompt: string;

  @Column('text')
  response: string;

  @CreateDateColumn()
  createdAt: Date;
}
