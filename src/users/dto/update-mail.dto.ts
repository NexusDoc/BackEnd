import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class UpdateEmailDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty()
  newEmail: string;
}