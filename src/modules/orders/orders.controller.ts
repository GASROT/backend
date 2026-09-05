import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { RequireAuthGuard } from '../auth/require-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.service';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(RequireAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  listOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.listOrders(user.id);
  }

  @Get(':id')
  getOrder(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.ordersService.getOrder(user.id, id);
  }

  @Post(':id/cancel')
  cancelOrder(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.ordersService.cancelOrder(user.id, id);
  }
}
