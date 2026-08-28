import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import {
  AddressDto,
  LgpdConsentDto,
  TechnicalResponsibleDto,
  ToggleBiometricsDto,
  UpdateProfileDto,
} from './dto/profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile() {
    return this.profileService.getProfile();
  }

  @Patch()
  updateProfile(@Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(dto);
  }

  @Post('addresses')
  addAddress(@Body() dto: AddressDto) {
    return this.profileService.addAddress(dto);
  }

  @Delete('addresses/:id')
  removeAddress(@Param('id') id: string) {
    return this.profileService.removeAddress(id);
  }

  @Patch('biometrics')
  updateBiometrics(@Body() dto: ToggleBiometricsDto) {
    return this.profileService.updateBiometrics(dto.enabled);
  }

  @Patch('technical-responsible')
  updateTechnicalResponsible(@Body() dto: TechnicalResponsibleDto) {
    return this.profileService.updateTechnicalResponsible(dto.cpf, dto.crea);
  }

  @Patch('lgpd')
  updateLgpdConsent(@Body() dto: LgpdConsentDto) {
    return this.profileService.updateLgpdConsent(dto.consent);
  }
}
