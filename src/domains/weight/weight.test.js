import weight, { unitMap } from './weight';
import conversionTests from './test-utils/conversionTests';
import {
  matchTester,
  conversionTester,
  validateRenderSettings,
} from '../test-utils';

it.each([
  ['10kg', [{ kg: 10 }]],
  ['100 g 40', [{ g: 100 }]], // Prioritize numbers on the left
  ['lb 30', [{ lb: 30 }]], // Still match numebrs on the right
  ['20 lbs, 20 grams', [{ lb: 20 }, { lb: 20 }]], // Matches plurals
  ['g', []], // Doesn't match without a number
])('Matches units', matchTester(weight.match.bind(weight), unitMap));

it.each(conversionTests)(
  'Converts correctly',
  conversionTester(weight.convert.bind(weight), unitMap)
);

describe('Render Settings', () => {
  /** @type {Awaited<ReturnType<weight['getRenderSettings']>>} */
  let renderSettings;
  beforeEach(async () => {
    renderSettings = await weight.getRenderSettings();
  });

  it('Returns valid values', () => {
    validateRenderSettings(renderSettings, unitMap);
  });
});
