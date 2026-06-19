import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('trace_maps')
export class TraceMap {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  // { pattern, emotion, adaptation, origin }
  @Column('jsonb')
  nodes: Record<string, string>;

  @Column('text', { array: true })
  glossaryTerms: string[];

  @Column('text', { array: true })
  strengths: string[];

  @Column('text')
  future: string;

  @Column('text')
  reflection: string;
}
