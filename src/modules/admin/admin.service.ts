import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { OrderStatus, ProductCategory, ProductUnit, ToxicClass } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { CatalogService } from '../catalog/catalog.service';
import {
  CreateAdminProductDto,
  UpdateAdminProductDto,
  UpdateOrderStatusDto,
} from './dto/admin.dto';

const allowedOrderTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['SEPARANDO', 'CANCELADO'],
  SEPARANDO: ['ENVIADO'],
  ENVIADO: ['ENTREGUE'],
  ENTREGUE: [],
  CANCELADO: [],
};

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogService: CatalogService,
  ) {}

  async getMetrics() {
    const [orders, products, lowStockCount] = await Promise.all([
      this.prisma.order.findMany({
        select: {
          status: true,
          total: true,
          createdAt: true,
        },
      }),
      this.prisma.product.findMany({
        select: {
          stock: true,
          price: true,
        },
      }),
      this.prisma.product.count({
        where: {
          stock: {
            lte: 10,
          },
        },
      }),
    ]);

    const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const averageTicket = orders.length ? revenue / orders.length : 0;
    const inventoryValue = products.reduce(
      (sum, product) => sum + Number(product.price) * product.stock,
      0,
    );

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => order.status === 'PENDENTE').length,
      confirmedOrders: orders.filter((order) => order.status === 'CONFIRMADO').length,
      shippedOrders: orders.filter((order) => order.status === 'ENVIADO').length,
      deliveredOrders: orders.filter((order) => order.status === 'ENTREGUE').length,
      cancelledOrders: orders.filter((order) => order.status === 'CANCELADO').length,
      revenue,
      averageTicket,
      productsInCatalog: products.length,
      lowStockProducts: lowStockCount,
      inventoryValue,
      generatedAt: new Date().toISOString(),
    };
  }

  async createProduct(dto: CreateAdminProductDto) {
    if (dto.pmf !== undefined && dto.price < dto.pmf) {
      throw new UnprocessableEntityException(
        'Preco de venda nao pode ser inferior ao preco minimo do fabricante.',
      );
    }

    if ((dto.toxicClass === 'I' || dto.toxicClass === 'II') && !dto.requiresAgronomistCpf) {
      throw new UnprocessableEntityException(
        'Defensivos classe I/II exigem responsavel tecnico para compra.',
      );
    }

    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
      select: { id: true },
    });

    if (existingProduct) {
      throw new BadRequestException('SKU ja cadastrado.');
    }

    const product = await this.prisma.product.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        manufacturer: dto.manufacturer,
        sku: dto.sku,
        category: dto.category as ProductCategory,
        subcategory: dto.subcategory,
        npk: dto.npk,
        dosage: dto.dosage,
        unit: dto.unit as ProductUnit,
        packageSize: dto.packageSize,
        price: dto.price,
        oldPrice: dto.oldPrice,
        pmf: dto.pmf,
        wholesalePrice: dto.wholesalePrice,
        rating: 0,
        reviews: 0,
        stock: dto.stock,
        minMultiple: dto.minMultiple ?? 1,
        mapa: dto.mapa,
        toxicClass: dto.toxicClass as ToxicClass | undefined,
        requiresAgronomistCpf: dto.requiresAgronomistCpf ?? false,
        technicalSheetUrl: dto.technicalSheetUrl,
        description: dto.description,
        application: dto.application,
        marker: dto.marker,
      },
    });

    return {
      ...product,
      price: Number(product.price),
      oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
      pmf: product.pmf === null ? undefined : Number(product.pmf),
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : undefined,
      rating: Number(product.rating),
    };
  }

  async updateProduct(id: string, dto: UpdateAdminProductDto) {
    const current = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        pmf: true,
        toxicClass: true,
        requiresAgronomistCpf: true,
        seasonalStartsAt: true,
        seasonalEndsAt: true,
      },
    });

    if (!current) {
      throw new NotFoundException('Produto nao encontrado.');
    }

    if (dto.sku) {
      const skuOwner = await this.prisma.product.findFirst({
        where: { sku: dto.sku, id: { not: id } },
        select: { id: true },
      });

      if (skuOwner) {
        throw new BadRequestException('SKU ja cadastrado.');
      }
    }

    const effectivePrice = dto.price ?? Number(current.price);
    const effectivePmf = dto.pmf === undefined
      ? current.pmf === null
        ? null
        : Number(current.pmf)
      : dto.pmf;

    if (effectivePmf !== null && effectivePrice < effectivePmf) {
      throw new UnprocessableEntityException(
        'Preco de venda nao pode ser inferior ao preco minimo do fabricante.',
      );
    }

    const effectiveToxicClass = dto.toxicClass === undefined ? current.toxicClass : dto.toxicClass;
    const requiresAgronomistCpf =
      dto.requiresAgronomistCpf ?? current.requiresAgronomistCpf;

    if ((effectiveToxicClass === 'I' || effectiveToxicClass === 'II') && !requiresAgronomistCpf) {
      throw new UnprocessableEntityException(
        'Defensivos classe I/II exigem responsavel tecnico para compra.',
      );
    }

    const effectiveSeasonalStartsAt =
      dto.seasonalStartsAt === undefined
        ? current.seasonalStartsAt
        : dto.seasonalStartsAt === null
          ? null
          : new Date(dto.seasonalStartsAt);
    const effectiveSeasonalEndsAt =
      dto.seasonalEndsAt === undefined
        ? current.seasonalEndsAt
        : dto.seasonalEndsAt === null
          ? null
          : new Date(dto.seasonalEndsAt);

    if (
      effectiveSeasonalStartsAt &&
      effectiveSeasonalEndsAt &&
      effectiveSeasonalStartsAt > effectiveSeasonalEndsAt
    ) {
      throw new UnprocessableEntityException(
        'Fim da disponibilidade sazonal deve ser posterior ao inicio.',
      );
    }

    await this.prisma.$transaction(async (transaction) => {
      await transaction.product.update({
        where: { id },
        data: {
          name: dto.name,
          manufacturer: dto.manufacturer,
          sku: dto.sku,
          category: dto.category as ProductCategory | undefined,
          subcategory: dto.subcategory,
          npk: dto.npk,
          dosage: dto.dosage,
          unit: dto.unit as ProductUnit | undefined,
          packageSize: dto.packageSize,
          price: dto.price,
          oldPrice: dto.oldPrice,
          pmf: dto.pmf,
          wholesalePrice: dto.wholesalePrice,
          stock: dto.stock,
          minMultiple: dto.minMultiple,
          mapa: dto.mapa,
          toxicClass: dto.toxicClass as ToxicClass | null | undefined,
          requiresAgronomistCpf: dto.requiresAgronomistCpf,
          technicalSheetUrl: dto.technicalSheetUrl,
          seasonalStartsAt:
            dto.seasonalStartsAt === undefined
              ? undefined
              : dto.seasonalStartsAt === null
                ? null
                : new Date(dto.seasonalStartsAt),
          seasonalEndsAt:
            dto.seasonalEndsAt === undefined
              ? undefined
              : dto.seasonalEndsAt === null
                ? null
                : new Date(dto.seasonalEndsAt),
          description: dto.description,
          application: dto.application,
          marker: dto.marker,
        },
      });

      if (dto.imageUrl) {
        const primaryImage = await transaction.productMedia.findFirst({
          where: { productId: id, type: 'image' },
          orderBy: { id: 'asc' },
          select: { id: true },
        });

        if (primaryImage) {
          await transaction.productMedia.update({
            where: { id: primaryImage.id },
            data: { url: dto.imageUrl },
          });
        } else {
          await transaction.productMedia.create({
            data: {
              id: crypto.randomUUID(),
              productId: id,
              type: 'image',
              title: `${dto.name ?? current.name} - imagem principal`,
              url: dto.imageUrl,
            },
          });
        }
      }
    });

    return this.catalogService.getProduct(id);
  }

  async listOrdersForAdmin() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                packageSize: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido nao encontrado.');
    }

    const nextStatus = dto.status as OrderStatus;
    if (!allowedOrderTransitions[order.status].includes(nextStatus)) {
      throw new UnprocessableEntityException(
        `Transicao de status invalida: ${order.status} para ${nextStatus}.`,
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: nextStatus },
    });
  }
}
