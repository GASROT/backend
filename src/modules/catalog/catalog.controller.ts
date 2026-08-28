import { Controller, Get, Param, Query } from '@nestjs/common';

import { CatalogService } from './catalog.service';
import { ListProductsDto } from './dto/list-products.dto';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  listProducts(@Query() query: ListProductsDto) {
    return this.catalogService.listProducts(query);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.catalogService.getProduct(id);
  }

  @Get('featured-banners')
  getFeaturedBanners() {
    return this.catalogService.getFeaturedBanners();
  }
}

