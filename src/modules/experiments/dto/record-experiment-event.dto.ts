import { IsIn, IsString, Matches, MaxLength } from 'class-validator';

export const HOME_HERO_CTA_EXPERIMENT = 'home-hero-cta-copy-v1' as const;

export class RecordExperimentEventDto {
  @IsIn([HOME_HERO_CTA_EXPERIMENT])
  experimentId: typeof HOME_HERO_CTA_EXPERIMENT;

  @IsIn(['control', 'alternative'])
  variant: 'control' | 'alternative';

  @IsIn(['exposure', 'conversion'])
  eventType: 'exposure' | 'conversion';

  @IsString()
  @MaxLength(80)
  @Matches(/^[a-zA-Z0-9_-]+$/)
  subjectId: string;
}
