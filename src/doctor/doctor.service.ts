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
import { User } from '../users/user.entity';

import {
  RecurringAvailability,
  WeekDay,
} from './availability/entities/recurring-availability.entity';
import { CustomAvailability } from './availability/entities/custom-availability.entity';
import {
  Appointment,
  AppointmentStatus,
} from '../appointments/appointment.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(DoctorProfile)
    private doctorRepository: Repository<DoctorProfile>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(RecurringAvailability)
    private recurringAvailabilityRepository: Repository<RecurringAvailability>,

    @InjectRepository(CustomAvailability)
    private customAvailabilityRepository: Repository<CustomAvailability>,

    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(userId: number, createDoctorDto: CreateDoctorProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingDoctor = await this.doctorRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    });

    if (existingDoctor) {
      throw new BadRequestException('Doctor profile already exists');
    }

    const doctor = this.doctorRepository.create({
      ...createDoctorDto,
      user,
    });

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
      throw new BadRequestException('Page and limit must be positive numbers');
    }

    const queryBuilder = this.doctorRepository.createQueryBuilder('doctor');

    if (specialization) {
      queryBuilder.andWhere(
        'LOWER(doctor.specialization) = LOWER(:specialization)',
        { specialization },
      );
    }

    if (search) {
      queryBuilder.andWhere('LOWER(doctor.fullName) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (availability !== undefined) {
      if (availability !== 'true' && availability !== 'false') {
        throw new BadRequestException('Availability must be true or false');
      }

      if (availability === 'true') {
        queryBuilder.andWhere('doctor.availability IS NOT NULL');
      }
    }

    queryBuilder.skip((pageNumber - 1) * limitNumber).take(limitNumber);

    const [doctors, total] = await queryBuilder.getManyAndCount();

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

  private validateSlotDate(date: string): Date {
    if (!date) {
      throw new BadRequestException('Date is required');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(date)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    const [year, month, day] = date.split('-').map(Number);

    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(0, 0, 0, 0);

    const isInvalidDate =
      selectedDate.getFullYear() !== year ||
      selectedDate.getMonth() !== month - 1 ||
      selectedDate.getDate() !== day;

    if (isInvalidDate) {
      throw new BadRequestException('Invalid date');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      throw new BadRequestException('Past date is not allowed');
    }

    return selectedDate;
  }

  private validateDuration(duration: number): void {
    if (![10, 15, 30].includes(duration)) {
      throw new BadRequestException(
        'Invalid duration. Allowed values are 10, 15, 30',
      );
    }
  }

  private getWeekDayFromDate(date: Date): WeekDay {
    const days: WeekDay[] = [
      WeekDay.SUNDAY,
      WeekDay.MONDAY,
      WeekDay.TUESDAY,
      WeekDay.WEDNESDAY,
      WeekDay.THURSDAY,
      WeekDay.FRIDAY,
      WeekDay.SATURDAY,
    ];

    return days[date.getDay()];
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new BadRequestException('Invalid time format');
    }

    return hours * 60 + minutes;
  }

  private minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}`;
  }

  private generateSlots(
    date: string,
    startTime: string,
    endTime: string,
    duration: number,
  ) {
    this.validateDuration(duration);

    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('Start time must be before end time');
    }

    const slots: { startTime: string; endTime: string; available: boolean }[] =
      [];

    const now = new Date();
    let currentStart = startMinutes;

    while (currentStart + duration <= endMinutes) {
      const currentEnd = currentStart + duration;

      const slotStartTime = this.minutesToTime(currentStart);
      const slotEndTime = this.minutesToTime(currentEnd);

      const slotStartDateTime = new Date(`${date}T${slotStartTime}:00`);

      if (slotStartDateTime > now) {
        slots.push({
          startTime: slotStartTime,
          endTime: slotEndTime,
          available: true,
        });
      }

      currentStart = currentEnd;
    }

    return slots;
  }

  async getAvailableSlots(doctorId: number, date: string, duration = 15) {
    const selectedDate = this.validateSlotDate(date);
    this.validateDuration(duration);

    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const customAvailability = await this.customAvailabilityRepository.find({
      where: {
        doctor: {
          id: doctorId,
        },
        date,
      },
      order: {
        startTime: 'ASC',
      },
    });

    let source = '';
    let availabilitySlots: { startTime: string; endTime: string }[] = [];

    if (customAvailability.length > 0) {
      source = 'CUSTOM';

      const unavailableDay = customAvailability.find(
        (slot) => !slot.isAvailable,
      );

      if (unavailableDay) {
        throw new NotFoundException(
          unavailableDay.reason || 'Doctor is not available on this date',
        );
      }

      availabilitySlots = customAvailability
        .filter((slot) => slot.isAvailable && slot.startTime && slot.endTime)
        .map((slot) => ({
          startTime: slot.startTime as string,
          endTime: slot.endTime as string,
        }));
    } else {
      source = 'RECURRING';

      const dayOfWeek = this.getWeekDayFromDate(selectedDate);

      const recurringAvailability =
        await this.recurringAvailabilityRepository.find({
          where: {
            doctor: {
              id: doctorId,
            },
            dayOfWeek,
          },
          order: {
            startTime: 'ASC',
          },
        });

      availabilitySlots = recurringAvailability.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));
    }

    if (availabilitySlots.length === 0) {
      throw new NotFoundException(
        'No availability found for this doctor on selected date',
      );
    }

    const generatedSlots = availabilitySlots.flatMap((slot) =>
      this.generateSlots(date, slot.startTime, slot.endTime, duration),
    );

    const uniqueGeneratedSlots = Array.from(
      new Map(
        generatedSlots.map((slot) => [
          `${slot.startTime}-${slot.endTime}`,
          slot,
        ]),
      ).values(),
    );

    if (uniqueGeneratedSlots.length === 0) {
      throw new NotFoundException('No future slots available');
    }

    const bookedAppointments = await this.appointmentRepository.find({
      where: {
        doctor: {
          id: doctorId,
        },
        date,
        status: AppointmentStatus.BOOKED,
      },
    });

    const bookedStartTimes = bookedAppointments.map((appointment) =>
      appointment.startTime.slice(0, 5),
    );

    const availableSlots = uniqueGeneratedSlots.filter(
      (slot) => !bookedStartTimes.includes(slot.startTime),
    );

    if (availableSlots.length === 0) {
      throw new NotFoundException('No available slots found');
    }

    return {
      message: 'Available slots fetched successfully',
      doctorId,
      date,
      duration,
      source,
      slots: availableSlots,
    };
  }
}