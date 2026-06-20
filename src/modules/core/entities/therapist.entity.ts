import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Sociotherapists / trauma-informed therapists who self-register to be
 * discoverable in Resources > Find Support.
 */
@Entity('therapists')
export class Therapist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column('text', { array: true, default: '{}' })
  specialties: string[];

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  // Full street address (optional) — basis for geocoding on registration.
  @Column('text', { nullable: true })
  addressLine: string;

  // Geocoded coordinates used for radius search. Nullable until geocoded.
  @Column('double precision', { nullable: true })
  latitude: number;

  @Column('double precision', { nullable: true })
  longitude: number;

  @Column('text', { nullable: true })
  bio: string;

  @Column({ default: false })
  verified: boolean;

  @CreateDateColumn()
  createdAt: Date;
}