import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Product, ProductMedia } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { ProfileService } from '../profile/profile.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
  ) {}

  async getCart() {
    const cartItems = await this.prisma.cartItem.findMany({
      include: {
        product: {
          include: {
            media: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const items = cartItems.map((item) => {
      const product = this.mapProduct(item.product);
      return {
        productId: item.productId,
        quantity: item.quantity,
        product,
        lineTotal: product.price * item.quantity,
        warning: product.stock < item.quantity ? 'Estoque alterado desde a inclusao.' : null,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const discount = subtotal * 0.1;
    const shipping = subtotal >= 500 ? 0 : 34.5;

    return {
      items,
      summary: {
        subtotal,
        discount,
        shipping,
        total: subtotal - discount + shipping,
      },
    };
  }

  async addItem(dto: AddCartItemDto) {
    const product = await this.getProduct(dto.productId);
    await this.assertPurchasable(product.id, dto.quantity);

    const current = await this.prisma.cartItem.findUnique({ where: { productId: product.id } });
    const nextQuantity = (current?.quantity ?? 0) + dto.quantity;
    await this.assertPurchasable(product.id, nextQuantity);

    await this.prisma.cartItem.upsert({
      where: {
        productId: product.id,
      },
      update: {
        quantity: nextQuantity,
      },
      create: {
        productId: product.id,
        quantity: nextQuantity,
      },
    });

    return this.getCart();
  }

  async updateItem(productId: string, dto: UpdateCartItemDto) {
    await this.assertPurchasable(productId, dto.quantity);

    const current = await this.prisma.cartItem.findUnique({ where: { productId } });
    if (!current) {
      throw new NotFoundException('Item nao encontrado no carrinho.');
    }

    await this.prisma.cartItem.update({
      where: {
        productId,
      },
      data: {
        quantity: dto.quantity,
      },
    });

    return this.getCart();
  }

  async removeItem(productId: string) {
    await this.prisma.cartItem.deleteMany({
      where: {
        productId,
      },
    });

    return this.getCart();
  }

  async clear() {
    await this.prisma.cartItem.deleteMany();
    return this.getCart();
  }

  private async assertPurchasable(productId: string, quantity: number) {
    const product = await this.getProduct(productId);

    if (product.stock === 0) {
      throw new BadRequestException('Produto esgotado nao pode ser adicionado ao carrinho.');
    }

    if (quantity > product.stock) {
      throw new BadRequestException('Quantidade solicitada excede o estoque disponivel.');
    }

    if (quantity % product.minMultiple !== 0) {
      throw new BadRequestException(`Quantidade deve respeitar multiplo de ${product.minMultiple}.`);
    }

    if (
      product.requiresAgronomistCpf &&
      ['I', 'II'].includes(product.toxicClass ?? '') &&
      !this.profileService.hasTechnicalResponsible()
    ) {
      throw new BadRequestException(
        'Defensivos classe I/II exigem responsavel tecnico cadastrado.',
      );
    }
  }

  private async getProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { media: true },
    });

    if (!product) throw new NotFoundException('Produto nao encontrado.');
    return this.mapProduct(product);
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
