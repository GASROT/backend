import { Injectable, NotFoundException } from '@nestjs/common';
import { Product, ProductCategory, ProductMedia, ToxicClass } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { ListProductsDto } from './dto/list-products.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(query: ListProductsDto) {
    const limit = Math.min(Number(query.limit ?? 20), 50);

    const products = await this.prisma.product.findMany({
      where: {
        category: query.category as ProductCategory | undefined,
        manufacturer: query.manufacturer
          ? { contains: query.manufacturer, mode: 'insensitive' }
          : undefined,
        price: {
          gte: query.minPrice ? Number(query.minPrice) : undefined,
          lte: query.maxPrice ? Number(query.maxPrice) : undefined,
        },
        stock: query.available === 'true' ? { gt: 0 } : undefined,
        toxicClass: query.toxicClass as ToxicClass | undefined,
        OR: query.search
          ? [
              { name: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
              { manufacturer: { contains: query.search, mode: 'insensitive' } },
              { npk: { contains: query.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: {
        media: true,
      },
    });

    const sorted = this.sortProducts(products, query.sort);
    const cursorIndex = query.cursor
      ? sorted.findIndex((product) => product.id === query.cursor) + 1
      : 0;

    const data = sorted.slice(cursorIndex, cursorIndex + limit).map((product) => this.mapProduct(product));
    const nextCursor = data.length === limit ? data[data.length - 1]?.id : null;

    return {
      data,
      pageInfo: {
        nextCursor,
        hasNextPage: Boolean(nextCursor),
      },
    };
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado.');
    }

    return this.mapProduct(product);
  }

  async getFeaturedBanners() {
    const banners = await this.prisma.featuredBanner.findMany({
      include: {
        product: {
          include: {
            media: true,
          },
        },
      },
      orderBy: {
        priority: 'asc',
      },
    });

    return banners
      .map((banner) => ({
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle,
        productId: banner.productId,
        tag: banner.discountLabel,
        discountLabel: banner.discountLabel,
        priority: banner.priority,
        product: this.mapProduct(banner.product),
      }));
  }

  private sortProducts(items: Array<Product & { media: ProductMedia[] }>, sort = 'relevance') {
    const sorted = items.slice();

    if (sort === 'price_asc') return sorted.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price_desc') return sorted.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'rating') return sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
    if (sort === 'newest') return sorted.reverse();

    return sorted.sort((a, b) => Number(b.oldPrice ?? 0) - Number(a.oldPrice ?? 0));
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
      pmf: product.pmf === null ? undefined : Number(product.pmf),
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : undefined,
      rating: Number(product.rating),
      reviews: product.reviews,
      stock: product.stock,
      minMultiple: product.minMultiple,
      dosage: product.dosage,
      description: product.description,
      application: product.application,
      technicalSheetUrl: product.technicalSheetUrl,
      seasonalStartsAt: product.seasonalStartsAt?.toISOString(),
      seasonalEndsAt: product.seasonalEndsAt?.toISOString(),
      mapa: product.mapa ?? undefined,
      toxicClass: product.toxicClass ?? undefined,
      requiresAgronomistCpf: product.requiresAgronomistCpf,
      marker: product.marker,
      media: product.media
        .slice()
        .sort((first, second) => {
          const priority = (media: ProductMedia) => {
            if (media.url) return 0;
            return media.type === 'image' ? 1 : 2;
          };

          return priority(first) - priority(second) || first.id.localeCompare(second.id);
        })
        .map((media) => ({
          id: media.id,
          type: media.type,
          title: media.title,
          url: media.url ?? undefined,
        })),
    };
  }
}
