import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
  ValidateIf,
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

export class UpdateAdminProductDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  manufacturer?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  sku?: string;

  @IsOptional()
  @IsIn(categories)
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  npk?: string | null;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsIn(units)
  unit?: string;

  @IsOptional()
  @IsString()
  packageSize?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  oldPrice?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  pmf?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  wholesalePrice?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  minMultiple?: number;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  mapa?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsIn(toxicClasses)
  toxicClass?: string | null;

  @IsOptional()
  @IsBoolean()
  requiresAgronomistCpf?: boolean;

  @IsOptional()
  @IsUrl({ require_tld: false, require_protocol: true, protocols: ['http', 'https'] })
  technicalSheetUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  application?: string;

  @IsOptional()
  @IsString()
  marker?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  seasonalStartsAt?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  seasonalEndsAt?: string | null;

  @IsOptional()
  @IsUrl({ require_tld: false, require_protocol: true, protocols: ['http', 'https'] })
  imageUrl?: string;
}

export class UpdateOrderStatusDto {
  @IsIn(orderStatuses)
  status: string;
}
