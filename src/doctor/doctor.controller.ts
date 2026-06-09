import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';

import { DoctorService } from './doctor.service';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/user.entity';
import { DoctorQueryDto } from './dto/doctor-query.dto';

@Controller('doctor')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @Post('profile')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.DOCTOR)
  create(@Body() createDoctorDto: CreateDoctorProfileDto) {
    return this.doctorService.create(createDoctorDto);
  }

  @Get()
  findAll(@Query() query: DoctorQueryDto) {
    return this.doctorService.findAll(query);
  }

  @Patch('profile/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.doctorService.update(Number(id), updateData);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.findOne(id);
  }
}