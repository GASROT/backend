import { Body, Controller, Post } from '@nestjs/common';

import { CheckoutService } from './checkout.service';
import { CepDto, ConfirmOrderDto, ShippingQuoteDto } from './dto/checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('address/autofill')
  autofillAddress(@Body() dto: CepDto) {
    return this.checkoutService.autofillAddress(dto.cep);
  }

  @Post('shipping/quote')
  quoteShipping(@Body() dto: ShippingQuoteDto) {
    return this.checkoutService.quoteShipping(dto);
  }

  @Post('orders')
  confirmOrder(@Body() dto: ConfirmOrderDto) {
    return this.checkoutService.confirmOrder(dto);
  }
}

