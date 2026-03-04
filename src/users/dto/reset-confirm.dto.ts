import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetConfirmDto {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}