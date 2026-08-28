import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { ForgotPasswordDto, LoginDto, RegisterDto, type UserRole } from './dto/auth.dto';
import { isValidCnpj, isValidCpf } from './document-validator';

type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  profileType: 'PF' | 'PJ';
  document: string;
  emailVerified: boolean;
  agronomistCpf?: string;
};

export type AuthenticatedUser = Omit<User, 'passwordHash' | 'document'>;

@Injectable()
export class AuthService {
  private readonly users = new Map<string, User>();
  private readonly failedLogins = new Map<string, { count: number; blockedUntil?: number }>();
  private readonly issuedTokens = new Map<string, string>();

  constructor() {
    this.users.set('cliente@agroshop.com.br', {
      id: 'customer-demo',
      name: 'Cliente AgroShop',
      email: 'cliente@agroshop.com.br',
      passwordHash: 'demo-hash:Cliente@12345',
      role: 'CUSTOMER',
      profileType: 'PF',
      document: '52998224725',
      emailVerified: true,
    });

    this.users.set('admin@agroshop.com.br', {
      id: 'admin-demo',
      name: 'Administrador AgroShop',
      email: 'admin@agroshop.com.br',
      passwordHash: 'demo-hash:Admin@12345',
      role: 'ADMIN',
      profileType: 'PJ',
      document: '11222333000181',
      emailVerified: true,
    });
  }

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
      role: 'CUSTOMER',
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

  validateAuthorizationHeader(authorization?: string): AuthenticatedUser | null {
    const [type, token] = authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      return null;
    }

    const email = this.issuedTokens.get(token);
    const user = email ? this.users.get(email) : undefined;

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileType: user.profileType,
      emailVerified: user.emailVerified,
      agronomistCpf: user.agronomistCpf,
    };
  }

  private createAuthResponse(user: User) {
    const accessToken = `demo-access-${user.id}-${crypto.randomUUID()}`;
    const refreshToken = `demo-refresh-${user.id}-${crypto.randomUUID()}`;

    this.issuedTokens.set(accessToken, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileType: user.profileType,
        emailVerified: user.emailVerified,
        hasAgronomistResponsible: Boolean(user.agronomistCpf),
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresInSeconds: 900,
        refreshExpiresInDays: 30,
      },
      redirectTo: user.role === 'ADMIN' ? '/admin/dashboard' : '/',
    };
  }
}
