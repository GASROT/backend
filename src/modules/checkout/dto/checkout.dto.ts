import { IsIn, IsOptional, IsString } from 'class-validator';

export class CepDto {
  @IsString()
  cep: string;
}

export class ShippingQuoteDto {
  @IsString()
  cep: string;

  @IsString()
  uf: string;
}

export class ConfirmOrderDto {
  @IsIn(['credit_card', 'pix', 'boleto'])
  paymentMethod: 'credit_card' | 'pix' | 'boleto';

  @IsString()
  shippingMethod: string;

  @IsString()
  deliveryCep: string;

  @IsOptional()
  @IsString()
  stripePaymentToken?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

