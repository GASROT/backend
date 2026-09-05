import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import {
  HOME_HERO_CTA_EXPERIMENT,
  RecordExperimentEventDto,
} from './dto/record-experiment-event.dto';

@Injectable()
export class ExperimentsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(dto: RecordExperimentEventDto) {
    await this.prisma.experimentEvent.upsert({
      where: {
        experimentId_variant_eventType_subjectId: dto,
      },
      create: dto,
      update: {},
      select: { id: true },
    });

    return { accepted: true };
  }

  async results(experimentId: typeof HOME_HERO_CTA_EXPERIMENT) {
    const events = await this.prisma.experimentEvent.findMany({
      where: { experimentId },
      select: { variant: true, eventType: true, subjectId: true },
    });

    const variants = (['control', 'alternative'] as const).map((variant) => {
      const exposures = new Set(
        events
          .filter((event) => event.variant === variant && event.eventType === 'exposure')
          .map((event) => event.subjectId),
      );
      const conversions = new Set(
        events
          .filter(
            (event) =>
              event.variant === variant &&
              event.eventType === 'conversion' &&
              exposures.has(event.subjectId),
          )
          .map((event) => event.subjectId),
      );

      return {
        variant,
        exposures: exposures.size,
        conversions: conversions.size,
        conversionRate: exposures.size === 0 ? 0 : conversions.size / exposures.size,
      };
    });

    return { experimentId, variants };
  }
}
