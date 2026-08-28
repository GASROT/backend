import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

const categories = ['fertilizante', 'defensivo', 'semente', 'irrigacao', 'maquinario', 'nutricao'];
const sortOptions = ['relevance', 'price_asc', 'price_desc', 'rating', 'newest'];
const toxicClasses = ['I', 'II', 'III', 'IV'];

export class ListProductsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(categories)
  category?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  available?: string;

  @IsOptional()
  @IsIn(toxicClasses)
  toxicClass?: string;

  @IsOptional()
  @IsIn(sortOptions)
  sort?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}

