import { IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class AddressDto {
  @IsString()
  cep: string;

  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  @Length(2, 2)
  uf: string;
}

export class ToggleBiometricsDto {
  @IsBoolean()
  enabled: boolean;
}

export class TechnicalResponsibleDto {
  @IsString()
  cpf: string;

  @IsString()
  crea: string;
}

export class LgpdConsentDto {
  @IsBoolean()
  consent: boolean;
}
