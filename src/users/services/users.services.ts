import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { MailService } from './mail.services';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async register(data: CreateUserDto) {
    const exists = await this.userRepository.findOne({ where: { email: data.email } });
    if (exists) throw new BadRequestException('E-mail já cadastrado');

    const hashed = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      password: hashed,
      role: data.role ?? 'user',
      resetCode: null,
      resetCodeExpires: null,
    });

    const savedUser = await this.userRepository.save(user);
    delete (savedUser as any).password;

    return savedUser;
  }

  async login(data: LoginUserDto) {
    const user = await this.userRepository.findOne({ where: { email: data.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new UnauthorizedException('Credenciais inválidas');

    const secret = process.env.JWT_SECRET!;
    const expiresInSeconds = Number(process.env.JWT_EXPIRES_IN) || 24 * 60 * 60;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: expiresInSeconds }
    );

    return { mensagem: 'Logado com sucesso!', token };
  }

  async resetRequest(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

      const expires = new Date(Date.now() + 15 * 60 * 1000);

      user.resetCode = hashedToken;
      user.resetCodeExpires = expires;

      await this.userRepository.save(user);

      const resetLink = `https://nexusdoc.org/reset_senha.php?t=${rawToken}`;

      await this.mailService.sendResetPasswordEmail(
        user.email,
        user.name,
        resetLink,
      );
    }

    return {
      mensagem: 'Se o e-mail existir em nosso sistema, você receberá instruções de redefinição de senha.',
    };
  }

  async resetWithToken(token: string, newPassword: string) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await this.userRepository.findOne({
      where: { resetCode: hashedToken },
    });

    if (!user) throw new BadRequestException('Token inválido');

    if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
      throw new BadRequestException('Token expirado');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = null;
    user.resetCodeExpires = null;

    await this.userRepository.save(user);

    return { mensagem: 'Senha alterada com sucesso!' };
  }

  async updateEmail(userId: string, newEmail: string) {
    const exists = await this.userRepository.findOne({ where: { email: newEmail } });
    if (exists) throw new BadRequestException('E-mail já cadastrado');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuário não encontrado');

    user.email = newEmail;
    await this.userRepository.save(user);

    return { mensagem: 'E-mail atualizado com sucesso!' };
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuário não encontrado');

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) throw new UnauthorizedException('Senha atual incorreta');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { mensagem: 'Senha alterada com sucesso!' };
  }
}