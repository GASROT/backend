import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthenticatedUser, AuthService } from './auth.service';

type RequestWithUser = {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedUser;
};

@Injectable()
export class RequireAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = await this.authService.validateAuthorizationHeader(request.headers.authorization);

    if (!user) {
      throw new UnauthorizedException('Faca login para continuar.');
    }

    request.user = user;
    return true;
  }
}
