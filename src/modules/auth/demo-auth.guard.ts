import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';

type RequestWithAuthorization = {
  headers: {
    authorization?: string;
  };
};

@Injectable()
export class DemoAdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithAuthorization>();
    const user = await this.authService.validateAuthorizationHeader(request.headers.authorization);

    if (!user) {
      throw new UnauthorizedException('Token de acesso ausente ou invalido.');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Acesso restrito ao administrador.');
    }

    return true;
  }
}
