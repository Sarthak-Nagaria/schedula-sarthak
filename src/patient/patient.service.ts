import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PatientProfile } from './patient-profile.entity';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(PatientProfile)
    private patientRepository: Repository<PatientProfile>,
  ) {}

  async create(createPatientDto: CreatePatientProfileDto) {
    const patient = this.patientRepository.create(createPatientDto);
    return this.patientRepository.save(patient);
  }

  async findAll() {
    return this.patientRepository.find();
  }
}