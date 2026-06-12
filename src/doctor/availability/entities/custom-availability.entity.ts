import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DoctorProfile } from '../../doctor-profile.entity';

@Entity('custom_availability')
export class CustomAvailability {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => DoctorProfile, { onDelete: 'CASCADE', nullable: false })
  doctor!: DoctorProfile;

  @Column({ type: 'date' })
  date!: string;

  @Column({ default: true })
  isAvailable!: boolean;

  @Column({ type: 'time', nullable: true })
  startTime!: string | null;

  @Column({ type: 'time', nullable: true })
  endTime!: string | null;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}