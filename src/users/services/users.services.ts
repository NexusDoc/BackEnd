import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(data: CreateUserDto) {
    const exists = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (exists) throw new BadRequestException('E-mail já cadastrado');

    const hashed = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      password: hashed,
      role: 'user',
    });

    return this.userRepository.save(user);
  }

  async login(data: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new UnauthorizedException('Credenciais inválidas');

    const secret = process.env.JWT_SECRET!;
    const expiresInSeconds = 24 * 60 * 60;

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: expiresInSeconds } // ✅ número em segundos
    );

    return {
      mensagem: 'Logado com sucesso!',
      token,
    };
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}