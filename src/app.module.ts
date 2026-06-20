import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FirebaseModule } from './modules/firebase/firebase.module';
import { FirebaseAuthGuard } from './modules/firebase/firebase-auth.guard';
import { UsersModule } from './modules/users/users.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TraceMapsModule } from './modules/trace-maps/trace-maps.module';
import { GlossaryModule } from './modules/glossary/glossary.module';
import { JournalModule } from './modules/journal/journal.module';
import { TherapistsModule } from './modules/therapists/therapists.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

import common from './configs/common.config'
import typeorm from './configs/typeorm.config';
import configSchema from './configs/schema.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Broker } from './broker/broker';
import { CoreModule } from './modules/core/core.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';


@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true }),
     ConfigModule.forRoot({
      load: [common, typeorm],
      ...configSchema,
      isGlobal: true,
      envFilePath: '.env',
    }),
   
     TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get('typeorm'),
    }),
    ThrottlerModule.forRoot([{ ttl: 30000, limit: 10 }]),
    CoreModule,
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
    Broker,
        {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // FirebaseAuthGuard is provided per-controller via @UseGuards, but exported
    // here so DI can resolve UsersService + FirebaseService for it.
    FirebaseAuthGuard,
  ],
   exports: [Broker],
})
export class AppModule {}
