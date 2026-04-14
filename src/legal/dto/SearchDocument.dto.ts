import { 
  IsString, 
  IsEmail, 
  IsArray, 
  IsOptional, 
  IsNotEmpty 
} from 'class-validator';

export class SearchDocumentDto {
  @IsString()
  @IsNotEmpty({ message: 'O documento não pode estar vazio' })
  document: string;

  @IsEmail({}, { message: 'O e-mail deve ser um endereço válido' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório para identificar o usuário' })
  email: string;

  @IsArray({ message: 'Os processos devem ser enviados em formato de lista' })
  @IsOptional()
  @IsString({ each: true, message: 'Cada processo na lista deve ser uma string' }) // Adicionado
  foundProcesses?: string[]; 
}