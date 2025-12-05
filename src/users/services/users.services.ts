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
      resetCode: null,
      resetCodeExpires: null,
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
      { expiresIn: expiresInSeconds }
    );

    return {
      mensagem: 'Logado com sucesso!',
      token,
    };
  }

  async resetRequest(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new BadRequestException('Usuário não encontrado');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    user.resetCode = code;
    user.resetCodeExpires = expires;

    await this.userRepository.save(user);

    return {
      mensagem: 'Código gerado com sucesso!',
      codigo: code,
      expiraEm: expires,
    };
  }

  async resetConfirm(email: string, code: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new BadRequestException('Usuário não encontrado');

    if (!user.resetCode || !user.resetCodeExpires)
      throw new BadRequestException('Nenhum reset solicitado');

    if (user.resetCode !== code)
      throw new BadRequestException('Código inválido');

    if (user.resetCodeExpires < new Date())
      throw new BadRequestException('Código expirado');

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    user.resetCode = null;
    user.resetCodeExpires = null;

    await this.userRepository.save(user);

    return {
      mensagem: 'Senha alterada com sucesso!',
    };
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}