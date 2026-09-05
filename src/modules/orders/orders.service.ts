import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Order, OrderItem, Product, ProductMedia } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: this.orderIncludes(),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => this.mapOrder(order));
  }

  async getOrder(userId: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.orderIncludes(),
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Pedido nao encontrado.');
    }

    return this.mapOrder(order);
  }

  async cancelOrder(userId: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.orderIncludes(),
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Pedido nao encontrado.');
    }

    if (!['PENDENTE', 'CONFIRMADO'].includes(order.status)) {
      throw new UnprocessableEntityException(
        'Pedido so pode ser cancelado quando PENDENTE ou CONFIRMADO.',
      );
    }

    const cancelled = await this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELADO' },
      include: this.orderIncludes(),
    });

    return {
      ...this.mapOrder(cancelled),
      stockReleaseSlaMinutes: 5,
      refundSlaBusinessDays: 7,
    };
  }

  private orderIncludes() {
    return {
      items: {
        include: {
          product: {
            include: {
              media: true,
            },
          },
        },
      },
    } as const;
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
        product: this.mapProduct(item.product),
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
    };
  }

  private mapProduct(product: Product & { media: ProductMedia[] }) {
    return {
      id: product.id,
      name: product.name,
      manufacturer: product.manufacturer,
      sku: product.sku,
      category: product.category,
      subcategory: product.subcategory,
      npk: product.npk ?? undefined,
      unit: product.unit,
      packageSize: product.packageSize,
      price: Number(product.price),
      oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : undefined,
      rating: Number(product.rating),
      reviews: product.reviews,
      stock: product.stock,
      minMultiple: product.minMultiple,
      dosage: product.dosage,
      description: product.description,
      application: product.application,
      technicalSheetUrl: product.technicalSheetUrl,
      mapa: product.mapa ?? undefined,
      toxicClass: product.toxicClass ?? undefined,
      requiresAgronomistCpf: product.requiresAgronomistCpf,
      marker: product.marker,
      media: product.media.map((media) => ({
        id: media.id,
        type: media.type,
        title: media.title,
        url: media.url ?? undefined,
      })),
    };
  }
}
