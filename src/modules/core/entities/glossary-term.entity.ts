import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('glossary_terms')
export class GlossaryTerm {
  @PrimaryColumn()
  id: string;

  @Column()
  term: string;

  @Column('text')
  definition: string;

  @Column('text')
  description: string;

  @Column('text', { array: true })
  commonSigns: string[];

  @Column('text', { array: true })
  relatedConcepts: string[];

  @Column('text')
  reflectionQuestion: string;

  @Column('text', { array: true })
  relatedTraceMaps: string[];
}
