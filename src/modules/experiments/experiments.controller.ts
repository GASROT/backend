import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { DemoAdminGuard } from '../auth/demo-auth.guard';
import {
  HOME_HERO_CTA_EXPERIMENT,
  RecordExperimentEventDto,
} from './dto/record-experiment-event.dto';
import { ExperimentsService } from './experiments.service';

@Controller('experiments')
export class ExperimentsController {
  constructor(private readonly experimentsService: ExperimentsService) {}

  @Post('events')
  @HttpCode(HttpStatus.ACCEPTED)
  record(@Body() dto: RecordExperimentEventDto) {
    return this.experimentsService.record(dto);
  }

  @Get('home-hero-cta-copy-v1/results')
  @UseGuards(DemoAdminGuard)
  results() {
    return this.experimentsService.results(HOME_HERO_CTA_EXPERIMENT);
  }
}
