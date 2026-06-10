import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';

import { PatientService } from './patient.service';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';

@Controller('patient')
export class PatientController {
  constructor(private patientService: PatientService) {}

  @Post('profile')
  create(@Body() createPatientDto: CreatePatientProfileDto) {
    return this.patientService.create(createPatientDto);
  }

  @Get('profile')
  findAll() {
    return this.patientService.findAll();
  }

  @Patch('profile/:id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.patientService.update(Number(id), updateData);
  }
}