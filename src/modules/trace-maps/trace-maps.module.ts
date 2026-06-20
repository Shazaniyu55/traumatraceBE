import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraceMap } from '../core/entities/trace-map.entity';
import { TraceMapsService } from './trace-maps.service';

@Module({
  imports: [TypeOrmModule.forFeature([TraceMap])],
  providers: [TraceMapsService],
  exports: [TraceMapsService],
})
export class TraceMapsModule {}
