export class CreatePatientProfileDto {
  fullName!: string;
  age!: number;
  gender!: string;
  contactDetails!: string;
  healthInfo?: string;
}