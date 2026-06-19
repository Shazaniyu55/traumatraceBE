import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Therapist } from './therapist.entity';
import { TherapistsService } from './therapists.service';
import { TherapistsController } from './therapists.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Therapist])],
  providers: [TherapistsService],
  controllers: [TherapistsController],
})
export class TherapistsModule {}
