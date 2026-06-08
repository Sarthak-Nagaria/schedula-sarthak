import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';

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

  @Patch('profile/:id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.doctorService.update(Number(id), updateData);
  }
}