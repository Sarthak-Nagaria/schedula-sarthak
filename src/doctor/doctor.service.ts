import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DoctorProfile } from './doctor-profile.entity';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(DoctorProfile)
    private doctorRepository: Repository<DoctorProfile>,
  ) {}

  async create(createDoctorDto: CreateDoctorProfileDto) {
    const doctor = this.doctorRepository.create(createDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async findAll() {
    return this.doctorRepository.find();
  }

  async update(id: number, updateData: Partial<DoctorProfile>) {
    await this.doctorRepository.update(id, updateData);

    return this.doctorRepository.findOne({
      where: { id },
    });
  }
}