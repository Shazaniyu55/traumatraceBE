import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Therapist } from '../core/entities/therapist.entity';
import { TherapistsService } from './therapists.service';
import { TherapistsController } from './therapists.controller';
import { MapsModule } from '@modules/googlemap/maps.module';
import { MailModule } from '@modules/mail/mail.module';


@Module({
  imports: [TypeOrmModule.forFeature([Therapist]), MapsModule, MailModule],
  providers: [TherapistsService],
  controllers: [TherapistsController],
})
export class TherapistsModule {}