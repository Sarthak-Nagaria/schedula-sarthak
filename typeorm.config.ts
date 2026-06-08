import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { User } from './src/users/user.entity';
import { DoctorProfile } from './src/doctor/doctor-profile.entity';
import { PatientProfile } from './src/patient/patient-profile.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123456',
  database: 'schedula',

  entities: [User, DoctorProfile, PatientProfile],
  migrations: ['src/migrations/*.ts'],
});

export default AppDataSource;