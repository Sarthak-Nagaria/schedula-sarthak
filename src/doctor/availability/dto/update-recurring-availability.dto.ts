import { IsEnum, IsOptional, Matches } from 'class-validator';
import { WeekDay } from '../entities/recurring-availability.entity';

export class UpdateRecurringAvailabilityDto {
  @IsOptional()
  @IsEnum(WeekDay)
  dayOfWeek?: WeekDay;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime?: string;
}