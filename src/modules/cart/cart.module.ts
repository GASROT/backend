import { Module } from '@nestjs/common';

import { ProfileModule } from '../profile/profile.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [ProfileModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
