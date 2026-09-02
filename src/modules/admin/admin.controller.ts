import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { DemoAdminGuard } from '../auth/demo-auth.guard';
import { AdminService } from './admin.service';
import {
  CreateAdminProductDto,
  UpdateAdminProductDto,
  UpdateOrderStatusDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(DemoAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  getMetrics() {
    return this.adminService.getMetrics();
  }

  @Post('products')
  createProduct(@Body() dto: CreateAdminProductDto) {
    return this.adminService.createProduct(dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateAdminProductDto) {
    return this.adminService.updateProduct(id, dto);
  }

  @Get('orders')
  listOrders() {
    return this.adminService.listOrdersForAdmin();
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.adminService.updateOrderStatus(id, dto);
  }
}
