import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { TraceMap } from '../core/entities/trace-map.entity';
import { GlossaryTerm } from '../core/entities/glossary-term.entity';
import { User } from '../core/entities/user.entity';
import { Report } from '../core/entities/report.entity';
import { JournalEntry } from '../core/entities/journal-entry.entity';
import { ReflectionResponse } from '../journal/reflection-response.entity';
import { Therapist } from '../core/entities/therapist.entity';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Seeds reference data (trace maps + glossary) from the JSON source-of-truth
 * files. Run with: npm run seed
 */
async function run() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASS ?? 'nexatech',
    database: process.env.DB_NAME ?? 'traumaTrace',
    entities: [
      TraceMap, GlossaryTerm, User, Report,
      JournalEntry, ReflectionResponse, Therapist,
    ],
    synchronize: true,
  });
  await ds.initialize();

  const dataDir = path.join(__dirname, 'data');
  const read = (f: string) =>
    JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf-8'));

  // Trace maps
  const traceMaps = read('trace_maps.json');
  const tmRepo = ds.getRepository(TraceMap);
  for (const m of traceMaps) {
    await tmRepo.save(
      tmRepo.create({
        id: m.id,
        title: m.title,
        nodes: m.nodes,
        glossaryTerms: m.glossary_terms,
        strengths: m.strengths,
        future: m.future,
        reflection: m.reflection,
      }),
    );
  }
  console.log(`Seeded ${traceMaps.length} trace maps`);

  // Glossary
  const glossary = read('glossary.json');
  const gRepo = ds.getRepository(GlossaryTerm);
  for (const g of glossary) {
    await gRepo.save(
      gRepo.create({
        id: g.id,
        term: g.term,
        definition: g.definition,
        description: g.description,
        commonSigns: g.common_signs,
        relatedConcepts: g.related_concepts,
        reflectionQuestion: g.reflection_question,
        relatedTraceMaps: g.related_trace_maps,
      }),
    );
  }
  console.log(`Seeded ${glossary.length} glossary terms`);

  await ds.destroy();
  console.log('Seed complete.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
