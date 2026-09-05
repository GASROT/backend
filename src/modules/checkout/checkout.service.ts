import { BadRequestException, Injectable } from '@nestjs/common';
import { Order, OrderItem, Product, ProductMedia } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { ConfirmOrderDto, ShippingQuoteDto } from './dto/checkout.dto';

@Injectable()
export class CheckoutService {
  private readonly processedOrders = new Map<string, unknown>();

  constructor(
    private readonly cartService: CartService,
    private readonly prisma: PrismaService,
  ) {}

  autofillAddress(cep: string) {
    return {
      cep,
      street: 'Estrada Rural Principal',
      district: 'Zona Agricola',
      city: 'Ribeirao Preto',
      uf: 'SP',
      source: 'viacep-mock',
    };
  }

  async quoteShipping(userId: string, dto: ShippingQuoteDto) {
    const freeThresholdByUf: Record<string, number> = {
      SP: 500,
      PR: 500,
      SC: 500,
      RS: 500,
    };
    const cart = await this.cartService.getCart(userId);
    const freeThreshold = freeThresholdByUf[dto.uf.toUpperCase()] ?? 900;

    return [
      {
        id: 'pac',
        label: 'PAC Rural',
        carrier: 'Correios',
        businessDays: 7,
        price: cart.summary.subtotal >= freeThreshold ? 0 : 18.9,
      },
      {
        id: 'sedex',
        label: 'SEDEX Agronegocio',
        carrier: 'Correios',
        businessDays: 2,
        price: 34.5,
      },
      {
        id: 'jadlog',
        label: 'Jadlog Cooperativas',
        carrier: 'Jadlog',
        businessDays: 4,
        price: 26.9,
      },
    ];
  }

  async confirmOrder(userId: string, dto: ConfirmOrderDto) {
    const idempotencyKey = dto.idempotencyKey ? `${userId}:${dto.idempotencyKey}` : null;
    if (idempotencyKey && this.processedOrders.has(idempotencyKey)) {
      return this.processedOrders.get(idempotencyKey);
    }

    const cart = await this.cartService.getCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Carrinho vazio.');
    }

    if (dto.paymentMethod === 'credit_card' && !dto.stripePaymentToken) {
      throw new BadRequestException('Cartao exige token Stripe. Dados de cartao nao sao aceitos.');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });

        if (!product || product.stock < item.quantity) {
          throw new BadRequestException('Quantidade solicitada excede o estoque disponivel.');
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const createdOrder = await tx.order.create({
        data: {
          id: `AG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`,
          userId,
          status: 'PENDENTE',
          paymentMethod: dto.paymentMethod,
          shippingMethod: dto.shippingMethod,
          deliveryAddress: dto.deliveryCep,
          subtotal: cart.summary.subtotal,
          discount: cart.summary.discount,
          shipping: cart.summary.shipping,
          total: cart.summary.total,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  media: true,
                },
              },
            },
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { userId } });

      return createdOrder;
    });

    const response = {
      ...this.mapOrder(order),
      paymentInstructions:
        dto.paymentMethod === 'pix'
          ? { qrCodeExpiresInMinutes: 30, copyPasteCode: '000201-agroshop-pix-demo' }
          : dto.paymentMethod === 'boleto'
            ? { dueInBusinessDays: 3, boletoUrl: 'https://pay.agroshop.local/boleto/demo' }
            : { cardTokenized: true, status: 'pending_gateway_callback' },
    };

    if (idempotencyKey) {
      this.processedOrders.set(idempotencyKey, response);
    }

    return response;
  }

  private mapOrder(
    order: Order & {
      items: Array<OrderItem & { product: Product & { media: ProductMedia[] } }>;
    },
  ) {
    return {
      id: order.id,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      date: new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(order.createdAt),
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      deliveryAddress: order.deliveryAddress,
      tracking: order.trackingCode ?? 'Aguardando coleta',
      trackingCode: order.trackingCode,
      carrier: order.carrier,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shipping: Number(order.shipping),
      total: Number(order.total),
      products: order.items.map((item) => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          manufacturer: item.product.manufacturer,
          sku: item.product.sku,
          category: item.product.category,
          subcategory: item.product.subcategory,
          npk: item.product.npk ?? undefined,
          unit: item.product.unit,
          packageSize: item.product.packageSize,
          price: Number(item.product.price),
          oldPrice: item.product.oldPrice ? Number(item.product.oldPrice) : undefined,
          wholesalePrice: item.product.wholesalePrice
            ? Number(item.product.wholesalePrice)
            : undefined,
          rating: Number(item.product.rating),
          reviews: item.product.reviews,
          stock: item.product.stock,
          minMultiple: item.product.minMultiple,
          dosage: item.product.dosage,
          description: item.product.description,
          application: item.product.application,
          technicalSheetUrl: item.product.technicalSheetUrl,
          mapa: item.product.mapa ?? undefined,
          toxicClass: item.product.toxicClass ?? undefined,
          requiresAgronomistCpf: item.product.requiresAgronomistCpf,
          marker: item.product.marker,
          media: item.product.media.map((media) => ({
            id: media.id,
            type: media.type,
            title: media.title,
            url: media.url ?? undefined,
          })),
        },
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
    };
  }
}
