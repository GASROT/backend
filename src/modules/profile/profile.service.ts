import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { isValidCpf } from '../auth/document-validator';
import { AddressDto, UpdateProfileDto } from './dto/profile.dto';

type Address = AddressDto & {
  id: string;
};

@Injectable()
export class ProfileService {
  private profile = {
    id: 'demo-user',
    name: 'AgroShop Demo',
    email: 'produtor@agroshop.com.br',
    phone: '(16) 99999-0000',
    profileType: 'PF',
    documentMasked: '***.123.456-**',
    emailVerified: true,
    pushNotificationsEnabled: true,
    biometricsEnabled: false,
    lgpdConsent: true,
    agronomistResponsible: null as null | { cpfMasked: string; crea: string },
  };

  private readonly addresses: Address[] = [
    {
      id: 'addr-rural-principal',
      cep: '14000-000',
      street: 'Estrada Rural Principal, km 8',
      city: 'Ribeirao Preto',
      uf: 'SP',
    },
  ];

  getProfile() {
    return {
      ...this.profile,
      addresses: this.addresses,
    };
  }

  updateProfile(dto: UpdateProfileDto) {
    this.profile = {
      ...this.profile,
      ...dto,
    };
    return this.getProfile();
  }

  addAddress(dto: AddressDto) {
    if (this.addresses.length >= 5) {
      throw new BadRequestException('Limite de 5 enderecos atingido.');
    }

    this.addresses.push({
      id: randomUUID(),
      ...dto,
      uf: dto.uf.toUpperCase(),
    });
    return this.addresses;
  }

  removeAddress(id: string) {
    const index = this.addresses.findIndex((address) => address.id === id);
    if (index === -1) {
      throw new BadRequestException('Endereco nao encontrado.');
    }

    this.addresses.splice(index, 1);
    return this.addresses;
  }

  updateBiometrics(enabled: boolean) {
    this.profile = {
      ...this.profile,
      biometricsEnabled: enabled,
    };
    return this.getProfile();
  }

  updateTechnicalResponsible(cpf: string, crea: string) {
    if (!isValidCpf(cpf)) {
      throw new BadRequestException('CPF do responsavel tecnico invalido.');
    }

    const normalizedCpf = cpf.replace(/\D/g, '');
    this.profile = {
      ...this.profile,
      agronomistResponsible: {
        cpfMasked: `***.${normalizedCpf.slice(3, 6)}.${normalizedCpf.slice(6, 9)}-**`,
        crea,
      },
    };
    return this.getProfile();
  }

  updateLgpdConsent(consent: boolean) {
    this.profile = {
      ...this.profile,
      lgpdConsent: consent,
    };
    return this.getProfile();
  }

  hasTechnicalResponsible() {
    return Boolean(this.profile.agronomistResponsible);
  }
}
