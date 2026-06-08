import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { DoctorProfile } from './doctor-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorProfile])],
  providers: [DoctorService],
  controllers: [DoctorController],
})
export class DoctorModule {}