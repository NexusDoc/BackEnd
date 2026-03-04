import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  phone: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;


  @IsOptional()
  @IsString()
  @IsIn(['user', 'admin'])
  role?: 'user' | 'admin';
}