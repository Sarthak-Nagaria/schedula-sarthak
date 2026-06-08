import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
    const existingDoctor = await this.doctorRepository.findOne({
      where: { fullName: createDoctorDto.fullName },
    });

    if (existingDoctor) {
      throw new BadRequestException('Doctor profile already exists');
    }

    const doctor = this.doctorRepository.create(createDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async findAll() {
    return this.doctorRepository.find();
  }

  async update(id: number, updateData: Partial<DoctorProfile>) {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    Object.assign(doctor, updateData);
    return this.doctorRepository.save(doctor);
  }
}