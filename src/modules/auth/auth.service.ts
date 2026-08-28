import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { ForgotPasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { isValidCnpj, isValidCpf } from './document-validator';

type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  profileType: 'PF' | 'PJ';
  document: string;
  emailVerified: boolean;
  agronomistCpf?: string;
};

@Injectable()
export class AuthService {
  private readonly users = new Map<string, User>();
  private readonly failedLogins = new Map<string, { count: number; blockedUntil?: number }>();

  register(dto: RegisterDto) {
    if (this.users.has(dto.email)) {
      throw new BadRequestException('E-mail ja associado a um perfil.');
    }

    const documentIsValid =
      dto.profileType === 'PF' ? isValidCpf(dto.document) : isValidCnpj(dto.document);

    if (!documentIsValid) {
      throw new BadRequestException('CPF/CNPJ invalido.');
    }

    if (dto.agronomistCpf && !isValidCpf(dto.agronomistCpf)) {
      throw new BadRequestException('CPF do responsavel tecnico invalido.');
    }

    const user: User = {
      id: crypto.randomUUID(),
      name: dto.name,
      email: dto.email,
      passwordHash: `demo-hash:${dto.password}`,
      profileType: dto.profileType,
      document: dto.document,
      emailVerified: false,
      agronomistCpf: dto.agronomistCpf,
    };

    this.users.set(user.email, user);
    return this.createAuthResponse(user);
  }

  login(dto: LoginDto) {
    const attempt = this.failedLogins.get(dto.email);
    if (attempt?.blockedUntil && attempt.blockedUntil > Date.now()) {
      throw new UnauthorizedException('Conta bloqueada por 15 minutos.');
    }

    const user = this.users.get(dto.email);
    if (!user || user.passwordHash !== `demo-hash:${dto.password}`) {
      const nextCount = (attempt?.count ?? 0) + 1;
      this.failedLogins.set(dto.email, {
        count: nextCount,
        blockedUntil: nextCount >= 5 ? Date.now() + 15 * 60 * 1000 : undefined,
      });
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    this.failedLogins.delete(dto.email);
    return this.createAuthResponse(user);
  }

  forgotPassword(dto: ForgotPasswordDto) {
    return {
      email: dto.email,
      tokenExpiresInMinutes: 60,
      message: 'Se o e-mail existir, enviaremos um link de recuperacao.',
    };
  }

  private createAuthResponse(user: User) {
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileType: user.profileType,
        emailVerified: user.emailVerified,
        hasAgronomistResponsible: Boolean(user.agronomistCpf),
      },
      tokens: {
        accessToken: `demo-access-${user.id}`,
        refreshToken: `demo-refresh-${user.id}`,
        expiresInSeconds: 900,
        refreshExpiresInDays: 30,
      },
    };
  }
}

