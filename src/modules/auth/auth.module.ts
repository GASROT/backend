import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DemoAdminGuard } from './demo-auth.guard';
import { RequireAuthGuard } from './require-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, DemoAdminGuard, RequireAuthGuard],
  exports: [AuthService, DemoAdminGuard, RequireAuthGuard],
})
export class AuthModule {}
