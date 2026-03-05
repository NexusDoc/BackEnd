import { Throttle } from '@nestjs/throttler';
import { Controller, Post, Body, Patch, HttpCode } from '@nestjs/common';
import { UsersService } from '../services/users.services';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { UpdateEmailDto } from '../dto/update-mail.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { ResetRequestDto } from '../dto/reset-request.dto';
import { ResetConfirmDto } from '../dto/reset-confirm.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() data: CreateUserDto) {
    return this.usersService.register(data);
  }

  @Post('login')
  @HttpCode(200) 
  async login(@Body() data: LoginUserDto) {
    return this.usersService.login(data);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('reset-request')
  async resetRequest(@Body() dto: ResetRequestDto) {
    return this.usersService.resetRequest(dto.email);
  }

  @Post('reset-confirm')
async resetConfirm(@Body() dto: ResetConfirmDto) {
  return this.usersService.resetWithToken(dto.token, dto.newPassword);
}
  
  @Patch('update-email')
  async updateEmail(@Body() dto: UpdateEmailDto) {
    return this.usersService.updateEmail(dto.userId, dto.newEmail);
  }

  @Patch('update-password')
  async updatePassword(@Body() dto: UpdatePasswordDto) {
    return this.usersService.updatePassword(dto.userId, dto.currentPassword, dto.newPassword);
  }
}