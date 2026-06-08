import { Controller, Post, Body, Get } from '@nestjs/common';

import { DoctorService } from './doctor.service';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';

@Controller('doctor')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @Post('profile')
  create(@Body() createDoctorDto: CreateDoctorProfileDto) {
    return this.doctorService.create(createDoctorDto);
  }

  @Get('profile')
  findAll() {
    return this.doctorService.findAll();
  }
}