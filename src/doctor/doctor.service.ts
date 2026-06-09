import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DoctorProfile } from './doctor-profile.entity';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { DoctorQueryDto } from './dto/doctor-query.dto';

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

  async findAll(query: DoctorQueryDto) {
    const {
      specialization,
      search,
      availability,
      page = '1',
      limit = '10',
    } = query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      !Number.isInteger(limitNumber) ||
      pageNumber <= 0 ||
      limitNumber <= 0
    ) {
      throw new BadRequestException(
        'Page and limit must be positive numbers',
      );
    }

    const queryBuilder =
      this.doctorRepository.createQueryBuilder('doctor');

    if (specialization) {
      queryBuilder.andWhere(
        'LOWER(doctor.specialization) = LOWER(:specialization)',
        { specialization },
      );
    }

    if (search) {
      queryBuilder.andWhere(
        'LOWER(doctor.fullName) LIKE LOWER(:search)',
        { search: `%${search}%` },
      );
    }

    if (availability !== undefined) {
      queryBuilder.andWhere(
        'LOWER(doctor.availability) = LOWER(:availability)',
        { availability: availability.toLowerCase() },
      );
    }

    queryBuilder
      .skip((pageNumber - 1) * limitNumber)
      .take(limitNumber);

    const [doctors, total] =
      await queryBuilder.getManyAndCount();

    return {
      message: doctors.length
        ? 'Doctors fetched successfully'
        : 'No doctors found',
      data: doctors,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  async findOne(id: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return {
      message: 'Doctor fetched successfully',
      data: doctor,
    };
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