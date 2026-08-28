import { Controller, Get, Param, Post } from '@nestjs/common';

import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  listOrders() {
    return this.ordersService.listOrders();
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }

  @Post(':id/cancel')
  cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }
}

