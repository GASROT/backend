import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart() {
    return this.cartService.getCart();
  }

  @Post('items')
  addItem(@Body() dto: AddCartItemDto) {
    return this.cartService.addItem(dto);
  }

  @Patch('items/:productId')
  updateItem(@Param('productId') productId: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(productId, dto);
  }

  @Delete('items/:productId')
  removeItem(@Param('productId') productId: string) {
    return this.cartService.removeItem(productId);
  }
}

