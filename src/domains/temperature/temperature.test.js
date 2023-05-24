import temperature, { unitMap } from './temperature';
import { matchTester, conversionTester } from '@/domains/test-utils';

it.each([
  ['42.7 C', [{ c: 42.7 }]],
  [
    '100 F? Youre good. But if it was 100°C or 100 K then...',
    [{ f: 100 }, { c: 100 }, { k: 100 }],
  ],
  ['0 Kelvin 101 : The coolest course', [{ k: 0 }]], // Prioritize amounts on the left
  ['Kelvin C Celsius F', []], // Must have an amount.
])(
  'Matches temperature',
  matchTester(temperature.match.bind(temperature), unitMap)
);

it.each([
  [{ c: 50 }, { c: 50, k: 323.15, f: 122 }],
  [{ f: 212.9 }, { f: 212.9, c: 100.5, k: 373.65 }],
  [{ k: 273.15 }, { k: 273.15, c: 0, f: 32 }],
  [{ f: -580 }, { f: -580, c: -340, k: -66.85 }],
])(
  'Converts temperatures correctly',
  conversionTester(temperature.convert.bind(temperature), unitMap)
);

describe('Render Settings', () => {
  let renderSettings;
  beforeEach(async () => {
    renderSettings = await temperature.getRenderSettings();
  });

  describe('Unit Templates', () => {
    it('Passes unit names as titles and upper case IDs as subtitles', () => {
      expect(renderSettings.unitTemplates.c).toEqual({
        title: unitMap.c.name,
        subtitle: unitMap.c.id.toUpperCase(),
      });
    });
  });

  it('Passes valid default IDs', () => {
    const { mainUnitID, secondaryUnitID } = renderSettings;
    [mainUnitID, secondaryUnitID].forEach((id) => {
      expect(Object.hasOwn(unitMap, id)).toBeTruthy();
    });
  });
});
