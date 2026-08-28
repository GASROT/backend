import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DemoAdminGuard } from './demo-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, DemoAdminGuard],
  exports: [AuthService, DemoAdminGuard],
})
export class AuthModule {}
