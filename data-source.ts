import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

import { User } from './src/users/user.entity';
import { DoctorProfile } from './src/doctor/doctor-profile.entity';
import { PatientProfile } from './src/patient/patient-profile.entity';
import { RecurringAvailability } from './src/doctor/availability/entities/recurring-availability.entity';
import { CustomAvailability } from './src/doctor/availability/entities/custom-availability.entity';
import { Appointment } from './src/appointments/appointment.entity';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    DoctorProfile,
    PatientProfile,
    RecurringAvailability,
    CustomAvailability,
    Appointment,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
  ssl:
    process.env.NODE_ENV === 'deployment'
      ? { rejectUnauthorized: false }
      : false,
});