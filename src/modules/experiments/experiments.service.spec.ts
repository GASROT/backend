import { ExperimentsService } from './experiments.service';

describe('ExperimentsService', () => {
  it('persists an allowlisted experiment event without personal data', async () => {
    const upsert = jest.fn().mockResolvedValue({ id: 'event-1' });
    const service = new ExperimentsService({ experimentEvent: { upsert } } as never);

    await expect(
      service.record({
        experimentId: 'home-hero-cta-copy-v1',
        variant: 'control',
        eventType: 'exposure',
        subjectId: 'session-b7b63288',
      }),
    ).resolves.toEqual({ accepted: true });

    expect(upsert).toHaveBeenCalledWith({
      where: {
        experimentId_variant_eventType_subjectId: {
          experimentId: 'home-hero-cta-copy-v1',
          variant: 'control',
          eventType: 'exposure',
          subjectId: 'session-b7b63288',
        },
      },
      create: {
        experimentId: 'home-hero-cta-copy-v1',
        variant: 'control',
        eventType: 'exposure',
        subjectId: 'session-b7b63288',
      },
      update: {},
      select: { id: true },
    });
  });

  it('calculates conversion by distinct exposed participant', async () => {
    const findMany = jest.fn().mockResolvedValue([
      { variant: 'control', eventType: 'exposure', subjectId: 'control-1' },
      { variant: 'control', eventType: 'exposure', subjectId: 'control-2' },
      { variant: 'control', eventType: 'conversion', subjectId: 'control-1' },
      { variant: 'control', eventType: 'conversion', subjectId: 'control-1' },
      { variant: 'alternative', eventType: 'exposure', subjectId: 'alternative-1' },
    ]);
    const service = new ExperimentsService({ experimentEvent: { findMany } } as never);

    await expect(service.results('home-hero-cta-copy-v1')).resolves.toEqual({
      experimentId: 'home-hero-cta-copy-v1',
      variants: [
        { variant: 'control', exposures: 2, conversions: 1, conversionRate: 0.5 },
        { variant: 'alternative', exposures: 1, conversions: 0, conversionRate: 0 },
      ],
    });
  });
});
