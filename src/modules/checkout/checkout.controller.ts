import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { RequireAuthGuard } from '../auth/require-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.service';
import { CheckoutService } from './checkout.service';
import { CepDto, ConfirmOrderDto, ShippingQuoteDto } from './dto/checkout.dto';

@Controller('checkout')
@UseGuards(RequireAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('address/autofill')
  autofillAddress(@Body() dto: CepDto) {
    return this.checkoutService.autofillAddress(dto.cep);
  }

  @Post('shipping/quote')
  quoteShipping(@CurrentUser() user: AuthenticatedUser, @Body() dto: ShippingQuoteDto) {
    return this.checkoutService.quoteShipping(user.id, dto);
  }

  @Post('orders')
  confirmOrder(@CurrentUser() user: AuthenticatedUser, @Body() dto: ConfirmOrderDto) {
    return this.checkoutService.confirmOrder(user.id, dto);
  }
}
