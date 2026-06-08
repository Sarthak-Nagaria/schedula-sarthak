import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
    const existingPatient = await this.patientRepository.findOne({
      where: { fullName: createPatientDto.fullName },
    });

    if (existingPatient) {
      throw new BadRequestException(
        'Patient profile already exists',
      );
    }

    const patient = this.patientRepository.create(createPatientDto);

    return this.patientRepository.save(patient);
  }

  async findAll() {
    return this.patientRepository.find();
  }

  async update(id: number, updateData: Partial<PatientProfile>) {
    const patient = await this.patientRepository.findOne({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException(
        'Patient profile not found',
      );
    }

    Object.assign(patient, updateData);

    return this.patientRepository.save(patient);
  }
}