import { 
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity("users")
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string; // <-- novo ID único, chave primária

  @Column({ unique: true })
  email: string; // agora é apenas único, não a PK

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ type: 'varchar', nullable: true })
  resetCode: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetCodeExpires: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}