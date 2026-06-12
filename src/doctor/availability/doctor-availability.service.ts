import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RecurringAvailability,
  WeekDay,
} from './entities/recurring-availability.entity';
import { CustomAvailability } from './entities/custom-availability.entity';
import { DoctorProfile } from '../doctor-profile.entity';
import { CreateRecurringAvailabilityDto } from './dto/create-recurring-availability.dto';
import { UpdateRecurringAvailabilityDto } from './dto/update-recurring-availability.dto';
import { CreateCustomAvailabilityDto } from './dto/create-custom-availability.dto';

@Injectable()
export class DoctorAvailabilityService {
  constructor(
    @InjectRepository(RecurringAvailability)
    private readonly recurringRepo: Repository<RecurringAvailability>,

    @InjectRepository(CustomAvailability)
    private readonly customRepo: Repository<CustomAvailability>,

    @InjectRepository(DoctorProfile)
    private readonly doctorRepo: Repository<DoctorProfile>,
  ) {}

  private async getDoctorProfile(userId: number): Promise<DoctorProfile> {
    const doctor = await this.doctorRepo.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return doctor;
  }

  private normalizeTime(time: string): string {
    return time.length === 5 ? `${time}:00` : time;
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    const normalizedStart = this.normalizeTime(startTime);
    const normalizedEnd = this.normalizeTime(endTime);

    if (normalizedStart >= normalizedEnd) {
      throw new BadRequestException('Start time must be before end time');
    }
  }

  private isOverlapping(
    newStart: string,
    newEnd: string,
    existingStart: string,
    existingEnd: string,
  ): boolean {
    return newStart < existingEnd && newEnd > existingStart;
  }

  private getWeekDayFromDate(date: string): WeekDay {
    const selectedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    const dayIndex = selectedDate.getDay();

    const days: WeekDay[] = [
      WeekDay.SUNDAY,
      WeekDay.MONDAY,
      WeekDay.TUESDAY,
      WeekDay.WEDNESDAY,
      WeekDay.THURSDAY,
      WeekDay.FRIDAY,
      WeekDay.SATURDAY,
    ];

    return days[dayIndex];
  }

  async createRecurringAvailability(
    userId: number,
    dto: CreateRecurringAvailabilityDto,
  ) {
    this.validateTimeRange(dto.startTime, dto.endTime);

    const doctor = await this.getDoctorProfile(userId);

    const existingSlots = await this.recurringRepo.find({
      where: {
        doctor: {
          id: doctor.id,
        },
        dayOfWeek: dto.dayOfWeek,
      },
      relations: ['doctor'],
    });

    for (const slot of existingSlots) {
      const newStart = this.normalizeTime(dto.startTime);
      const newEnd = this.normalizeTime(dto.endTime);
      const existingStart = this.normalizeTime(slot.startTime);
      const existingEnd = this.normalizeTime(slot.endTime);

      const duplicate = existingStart === newStart && existingEnd === newEnd;

      if (duplicate) {
        throw new BadRequestException('Duplicate availability slot exists');
      }

      if (this.isOverlapping(newStart, newEnd, existingStart, existingEnd)) {
        throw new BadRequestException(
          'Availability slot overlaps with existing slot',
        );
      }
    }

    const availability = this.recurringRepo.create({
      doctor,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });

    return this.recurringRepo.save(availability);
  }

  async getRecurringAvailability(userId: number) {
    const doctor = await this.getDoctorProfile(userId);

    return this.recurringRepo.find({
      where: {
        doctor: {
          id: doctor.id,
        },
      },
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async updateRecurringAvailability(
    userId: number,
    id: number,
    dto: UpdateRecurringAvailabilityDto,
  ) {
    const doctor = await this.getDoctorProfile(userId);

    const availability = await this.recurringRepo.findOne({
      where: { id },
      relations: ['doctor'],
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (availability.doctor.id !== doctor.id) {
      throw new ForbiddenException(
        'You are not allowed to update this availability',
      );
    }

    const updatedDay = dto.dayOfWeek ?? availability.dayOfWeek;
    const updatedStart = dto.startTime ?? availability.startTime;
    const updatedEnd = dto.endTime ?? availability.endTime;

    this.validateTimeRange(updatedStart, updatedEnd);

    const existingSlots = await this.recurringRepo.find({
      where: {
        doctor: {
          id: doctor.id,
        },
        dayOfWeek: updatedDay,
      },
      relations: ['doctor'],
    });

    for (const slot of existingSlots) {
      if (slot.id === id) continue;

      const newStart = this.normalizeTime(updatedStart);
      const newEnd = this.normalizeTime(updatedEnd);
      const existingStart = this.normalizeTime(slot.startTime);
      const existingEnd = this.normalizeTime(slot.endTime);

      const duplicate = existingStart === newStart && existingEnd === newEnd;

      if (duplicate) {
        throw new BadRequestException('Duplicate availability slot exists');
      }

      if (this.isOverlapping(newStart, newEnd, existingStart, existingEnd)) {
        throw new BadRequestException(
          'Availability slot overlaps with existing slot',
        );
      }
    }

    availability.dayOfWeek = updatedDay;
    availability.startTime = updatedStart;
    availability.endTime = updatedEnd;

    return this.recurringRepo.save(availability);
  }

  async deleteRecurringAvailability(userId: number, id: number) {
    const doctor = await this.getDoctorProfile(userId);

    const availability = await this.recurringRepo.findOne({
      where: { id },
      relations: ['doctor'],
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (availability.doctor.id !== doctor.id) {
      throw new ForbiddenException(
        'You are not allowed to delete this availability',
      );
    }

    await this.recurringRepo.remove(availability);

    return {
      message: 'Availability deleted successfully',
    };
  }

  async createCustomAvailability(
    userId: number,
    dto: CreateCustomAvailabilityDto,
  ) {
    this.getWeekDayFromDate(dto.date);

    const doctor = await this.getDoctorProfile(userId);

    if (dto.isAvailable) {
      if (!dto.startTime || !dto.endTime) {
        throw new BadRequestException(
          'Start time and end time are required when doctor is available',
        );
      }

      this.validateTimeRange(dto.startTime, dto.endTime);
    }

    if (!dto.isAvailable && !dto.reason) {
      throw new BadRequestException(
        'Reason is required when doctor is unavailable',
      );
    }

    const existingSlots = await this.customRepo.find({
      where: {
        doctor: {
          id: doctor.id,
        },
        date: dto.date,
      },
      relations: ['doctor'],
    });

    if (!dto.isAvailable && existingSlots.length > 0) {
      throw new BadRequestException(
        'Custom availability already exists for this date',
      );
    }

    if (dto.isAvailable) {
      for (const slot of existingSlots) {
        if (!slot.isAvailable) {
          throw new BadRequestException(
            'Doctor is already marked unavailable for this date',
          );
        }

        if (!slot.startTime || !slot.endTime) continue;

        const newStart = this.normalizeTime(dto.startTime!);
        const newEnd = this.normalizeTime(dto.endTime!);
        const existingStart = this.normalizeTime(slot.startTime);
        const existingEnd = this.normalizeTime(slot.endTime);

        const duplicate = existingStart === newStart && existingEnd === newEnd;

        if (duplicate) {
          throw new BadRequestException(
            'Duplicate custom availability slot exists',
          );
        }

        if (this.isOverlapping(newStart, newEnd, existingStart, existingEnd)) {
          throw new BadRequestException(
            'Custom availability slot overlaps with existing slot',
          );
        }
      }
    }

    const customAvailability = this.customRepo.create({
      doctor,
      date: dto.date,
      isAvailable: dto.isAvailable,
      startTime: dto.isAvailable ? dto.startTime! : null,
      endTime: dto.isAvailable ? dto.endTime! : null,
      reason: dto.reason ?? null,
    });

    return this.customRepo.save(customAvailability);
  }

  async getAvailabilityByDate(userId: number, date: string) {
    const dayOfWeek = this.getWeekDayFromDate(date);

    const doctor = await this.getDoctorProfile(userId);

    const customSlots = await this.customRepo.find({
      where: {
        doctor: {
          id: doctor.id,
        },
        date,
      },
      order: {
        startTime: 'ASC',
      },
    });

    if (customSlots.length > 0) {
      const unavailableSlot = customSlots.find((slot) => !slot.isAvailable);

      if (unavailableSlot) {
        return {
          date,
          type: 'CUSTOM_OVERRIDE',
          isAvailable: false,
          reason: unavailableSlot.reason,
          availability: [],
        };
      }

      return {
        date,
        type: 'CUSTOM_OVERRIDE',
        isAvailable: true,
        reason: customSlots[0].reason,
        availability: customSlots,
      };
    }

    const recurringSlots = await this.recurringRepo.find({
      where: {
        doctor: {
          id: doctor.id,
        },
        dayOfWeek,
      },
      order: {
        startTime: 'ASC',
      },
    });

    if (recurringSlots.length === 0) {
      return {
        date,
        type: 'UNAVAILABLE',
        isAvailable: false,
        availability: [],
        message: 'Doctor is not available on this date',
      };
    }

    return {
      date,
      type: 'RECURRING',
      isAvailable: true,
      availability: recurringSlots,
    };
  }
}