import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

const categories = ['fertilizante', 'defensivo', 'semente', 'irrigacao', 'maquinario', 'nutricao'];
const units = ['kg', 'L', 'sc', 'un'];
const toxicClasses = ['I', 'II', 'III', 'IV'];
const orderStatuses = ['PENDENTE', 'CONFIRMADO', 'SEPARANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'];

export class CreateAdminProductDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(2)
  manufacturer: string;

  @IsString()
  @MinLength(3)
  sku: string;

  @IsIn(categories)
  category: string;

  @IsString()
  subcategory: string;

  @IsOptional()
  @IsString()
  npk?: string;

  @IsString()
  dosage: string;

  @IsIn(units)
  unit: string;

  @IsString()
  packageSize: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  oldPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pmf?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  wholesalePrice?: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  minMultiple?: number;

  @IsOptional()
  @IsString()
  mapa?: string;

  @IsOptional()
  @IsIn(toxicClasses)
  toxicClass?: string;

  @IsOptional()
  @IsBoolean()
  requiresAgronomistCpf?: boolean;

  @IsUrl({ require_tld: false })
  technicalSheetUrl: string;

  @IsString()
  description: string;

  @IsString()
  application: string;

  @IsString()
  marker: string;
}

export class UpdateOrderStatusDto {
  @IsIn(orderStatuses)
  status: string;
}
