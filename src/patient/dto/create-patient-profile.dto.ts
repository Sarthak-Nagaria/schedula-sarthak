import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePatientProfileDto {
  @IsString()
  fullName!: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsString()
  gender!: string;

  @IsString()
  contactDetails!: string;

  @IsOptional()
  @IsString()
  healthInfo?: string;
}