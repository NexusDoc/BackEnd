import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ResetConfirmDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}