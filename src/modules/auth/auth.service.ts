import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { scryptSync, timingSafeEqual, randomBytes } from 'node:crypto';
import { ProfileType, User, UserRole } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { ForgotPasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { isValidCnpj, isValidCpf } from './document-validator';

export type AuthenticatedUser = Pick<
  User,
  'id' | 'name' | 'email' | 'role' | 'profileType' | 'emailVerified' | 'agronomistCpf'
>;

@Injectable()
export class AuthService {
  private readonly failedLogins = new Map<string, { count: number; blockedUntil?: number }>();
  private readonly issuedTokens = new Map<string, string>();

  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
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

    const user = await this.prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        email: dto.email,
        passwordHash: this.hashPassword(dto.password),
        role: UserRole.CUSTOMER,
        profileType: dto.profileType as ProfileType,
        document: dto.document,
        emailVerified: false,
        agronomistCpf: dto.agronomistCpf,
      },
    });

    return this.createAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const attempt = this.failedLogins.get(dto.email);
    if (attempt?.blockedUntil && attempt.blockedUntil > Date.now()) {
      throw new UnauthorizedException('Conta bloqueada por 15 minutos.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !this.verifyPassword(dto.password, user.passwordHash)) {
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

  async validateAuthorizationHeader(authorization?: string): Promise<AuthenticatedUser | null> {
    const [type, token] = authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      return null;
    }

    const email = this.issuedTokens.get(token);
    const user = email
      ? await this.prisma.user.findUnique({
          where: { email },
        })
      : undefined;

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

  private hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `scrypt:${salt}:${hash}`;
  }

  private verifyPassword(password: string, passwordHash: string) {
    const [, salt, expectedHash] = passwordHash.split(':');

    if (!salt || !expectedHash) {
      return false;
    }

    const actual = Buffer.from(scryptSync(password, salt, 64).toString('hex'), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');

    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }
}
