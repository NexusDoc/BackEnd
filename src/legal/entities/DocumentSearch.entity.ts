import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  CreateDateColumn 
} from 'typeorm';
import { Process } from './process.entity';

@Entity('document_searches')
export class DocumentSearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  encrypted_document: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  document_hash: string;

  @Column({ type: 'enum', enum: ['CPF', 'CNPJ'] })
  type: 'CPF' | 'CNPJ'; 

  @OneToMany(() => Process, (process) => process.documentSearch, { cascade: true })
  processes: Process[];

  @CreateDateColumn()
  updatedAt: Date;
}