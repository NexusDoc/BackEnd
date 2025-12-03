import { 
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
  } from 'typeorm';
  
  @Entity("users")
  export class User {
    @PrimaryColumn() 
    email: string;  // Agora é a chave primária
  
    @Column()
    name: string;
  
    @Column({ nullable: true })
    phone: string;
  
    @Column()
    password: string;
  
    @Column({ default: 'user' })
    role: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
