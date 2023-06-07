import length, { unitMap, groups } from './length';
import { matchTester, conversionTester, validateRenderSettings } from '@/domains/test-utils';
import converterTests from './test-utils/converterTests';

it.each([
  ['1000 miles', [{ mi: 1000 }]],
  ['7ft 10in', [{ ft: 7 }, { in: 10 }]], // Prioritize numbers on the left
  ['Coming up on mile 200', [{ mi: 200 }]], // Can match numbers on the right
  ['A game of inches ', []], // Needs a number to match
  ['25 cm or 0.5 mm', [{ cm: 25 }, { mm: 0.5 }]],
])('Matches length units', matchTester(length.match.bind(length), unitMap));

it.each(converterTests)(
  'Converts length values',
  conversionTester(length.convert.bind(length), unitMap)
);

describe('Render Settings', () => {
  let renderSettings;
  beforeEach(async () => {
    renderSettings = await length.getRenderSettings();
  });

  it('Groups units based on measurement system', () => {
    expect(renderSettings.groups).toEqual(groups);
  });

  it('Returns valid values', () => {
    validateRenderSettings(renderSettings, unitMap)
  })
});
