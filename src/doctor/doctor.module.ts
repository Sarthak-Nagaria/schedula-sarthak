import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { DoctorProfile } from './doctor-profile.entity';
import { User } from '../users/user.entity';
import { RecurringAvailability } from './availability/entities/recurring-availability.entity';
import { CustomAvailability } from './availability/entities/custom-availability.entity';
import { Appointment } from '../appointments/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DoctorProfile,
      User,
      RecurringAvailability,
      CustomAvailability,
      Appointment,
    ]),
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}