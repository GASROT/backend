import { Module } from '@nestjs/common';

import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { HealthController } from './modules/health.controller';
import { OrdersModule } from './modules/orders/orders.module';
import { ProfileModule } from './modules/profile/profile.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CatalogModule,
    CartModule,
    CheckoutModule,
    OrdersModule,
    ProfileModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
