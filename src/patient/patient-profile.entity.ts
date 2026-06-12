import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../users/user.entity';

@Entity()
export class PatientProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  fullName!: string;

  @Column({ type: 'date' })
  dateOfBirth!: string;

  @Column()
  gender!: string;

  @Column()
  contactDetails!: string;

  @Column({ nullable: true })
  healthInfo!: string;

  @OneToOne(() => User)
  @JoinColumn()
  user!: User;
}
