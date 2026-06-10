import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';

import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';
import { Role } from './users/user.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @Get('doctor/profile')
  getDoctorProfile() {
    return {
      message: 'Doctor profile accessed successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  @Get('patient/profile')
  getPatientProfile() {
    return {
      message: 'Patient profile accessed successfully',
    };
  }
}