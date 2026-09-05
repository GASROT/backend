import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedUser } from './auth.service';

type RequestWithUser = {
  user?: AuthenticatedUser;
};

/**
 * Extrai o usuario autenticado anexado pelo RequireAuthGuard.
 * So usar em rotas protegidas por esse guard.
 */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<RequestWithUser>();
  return request.user as AuthenticatedUser;
});
