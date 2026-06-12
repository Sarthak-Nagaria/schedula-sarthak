import { IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { WeekDay } from '../entities/recurring-availability.entity';

export class CreateRecurringAvailabilityDto {
  @IsEnum(WeekDay)
  dayOfWeek!: WeekDay;

  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime!: string;

  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime!: string;
}