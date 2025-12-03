import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { UsersService } from '../services/users.services';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';

@Controller('users') // Prefixo das rotas: /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.register(createUserDto);
    return {
      mensagem: 'Cadastro realizado com sucesso!',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  @Post('login')
  @HttpCode(200) 
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }
}