import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { DocumentSearch } from './DocumentSearch.entity';

@Entity('processes')
export class Process {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cnj_number: string;

  @Column({ nullable: true })
  court: string;

  @ManyToOne(() => DocumentSearch, (docSearch) => docSearch.processes, {
    onDelete: 'CASCADE'
  })
  documentSearch: DocumentSearch;
}