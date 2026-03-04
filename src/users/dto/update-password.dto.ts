import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'A nova senha deve ter pelo menos 6 caracteres' })
  @IsNotEmpty()
  newPassword: string;
}