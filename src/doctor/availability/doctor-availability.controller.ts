import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DoctorAvailabilityService } from './doctor-availability.service';
import { CreateRecurringAvailabilityDto } from './dto/create-recurring-availability.dto';
import { UpdateRecurringAvailabilityDto } from './dto/update-recurring-availability.dto';
import { CreateCustomAvailabilityDto } from './dto/create-custom-availability.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../users/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCTOR)
@Controller('doctor/availability')
export class DoctorAvailabilityController {
  constructor(
    private readonly availabilityService: DoctorAvailabilityService,
  ) {}

  @Post()
  createRecurringAvailability(
  @Req() req: any,
  @Body() dto: CreateRecurringAvailabilityDto,
 ) {
  console.log('Logged in user:', req.user);

  return this.availabilityService.createRecurringAvailability(
    req.user.id,
    dto,
  );
 }

  @Get()
  getRecurringAvailability(@Req() req: any) {
    return this.availabilityService.getRecurringAvailability(req.user.id);
  }

  @Patch(':id')
  updateRecurringAvailability(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateRecurringAvailabilityDto,
  ) {
    return this.availabilityService.updateRecurringAvailability(
      req.user.id,
      Number(id),
      dto,
    );
  }

  @Delete(':id')
  deleteRecurringAvailability(@Req() req: any, @Param('id') id: string) {
    return this.availabilityService.deleteRecurringAvailability(
      req.user.id,
      Number(id),
    );
  }

  @Post('override')
  createCustomAvailability(
    @Req() req: any,
    @Body() dto: CreateCustomAvailabilityDto,
  ) {
    return this.availabilityService.createCustomAvailability(
      req.user.id,
      dto,
    );
  }

  @Get('date')
  getAvailabilityByDate(@Req() req: any, @Query('date') date: string) {
    return this.availabilityService.getAvailabilityByDate(req.user.id, date);
  }
}