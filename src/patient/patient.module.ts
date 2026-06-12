import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PatientProfile } from './patient-profile.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientProfile, User])],
  providers: [PatientService],
  controllers: [PatientController],
})
export class PatientModule {}