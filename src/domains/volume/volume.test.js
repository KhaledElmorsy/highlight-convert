import volume, { unitMap, groups } from './volume';
import {
  matchTester,
  conversionTester,
  validateRenderSettings,
} from '../test-utils';
import conversionTests from './test-utils/conversionTests';

it.each([
  ['2 liter', [{ l: 2 }]],
  ['3.5 cups', [{ cup: 3.5 }]], // Matches plurals
  ['20 tbsp 5', [{ tbsp: 20 }]], // Prioritizes numbers on the left
  ['gallon', [{ gal: 1 }]], // Can match without a number, setting the amount to 1
  ['m3, 10cm3, 4 in3, 15 ft3', [{ m3: 1, cm3: 10, in3: 4, ft3: 15 }]], // Matches labels that include numbers
  ['10 fl oz or 50 cubic centimeters', [{ 'fl oz': 10, cm3: 50 }]], // Matches labels with spaces
])('Matches volume units', matchTester(volume.match.bind(volume), unitMap));

it.each(conversionTests)(
  'Converts correctly',
  conversionTester(volume.convert.bind(volume), unitMap)
);

describe('Render Settings', () => {
  let renderSettings;
  beforeEach(async () => {
    renderSettings = await volume.getRenderSettings();
  });
  it('Returns valid values', () => {
    validateRenderSettings(renderSettings, unitMap);
  });
  describe('Unit Templates', () => {
    test('Correct cup template', () => {
      expect(renderSettings.unitTemplates.cup).toEqual({
        title: 'Cup', // Cup's ID isn't capitalized, but its rendered title should be
      });
    });
  });
  it('Returns the correct group',() => {
    expect(renderSettings.groups).toEqual(groups)
  })
});
