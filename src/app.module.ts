import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FirebaseModule } from './firebase/firebase.module';
import { FirebaseAuthGuard } from './firebase/firebase-auth.guard';
import { UsersModule } from './users/users.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { ReportsModule } from './reports/reports.module';
import { TraceMapsModule } from './trace-maps/trace-maps.module';
import { GlossaryModule } from './glossary/glossary.module';
import { JournalModule } from './journal/journal.module';
import { TherapistsModule } from './therapists/therapists.module';
import { NotificationsModule } from './notifications/notifications.module';

import { User } from './users/user.entity';
import { Report } from './reports/report.entity';
import { TraceMap } from './trace-maps/trace-map.entity';
import { GlossaryTerm } from './glossary/glossary-term.entity';
import { JournalEntry } from './journal/journal-entry.entity';
import { ReflectionResponse } from './journal/reflection-response.entity';
import { Therapist } from './therapists/therapist.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'traumatrace',
      entities: [
        User, Report, TraceMap, GlossaryTerm,
        JournalEntry, ReflectionResponse, Therapist,
      ],
      // MVP convenience. Use migrations in production.
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    FirebaseModule,
    UsersModule,
    AssessmentsModule,
    ReportsModule,
    TraceMapsModule,
    GlossaryModule,
    JournalModule,
    TherapistsModule,
    NotificationsModule,
  ],
  providers: [
    // FirebaseAuthGuard is provided per-controller via @UseGuards, but exported
    // here so DI can resolve UsersService + FirebaseService for it.
    FirebaseAuthGuard,
  ],
})
export class AppModule {}
