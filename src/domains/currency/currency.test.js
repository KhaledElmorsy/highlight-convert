import currency, { getRates, cachedRates, units } from './currency';
import { matchTester } from '../test-utils';

const storedRates = { usd: 1, egp: 30, gbp: 0.8 };
jest.mock('./util', () => ({
  ...jest.requireActual('./util'),
  getStoredRates: jest.fn(async () => storedRates),
}));

describe('getRates():', () => {
  it('Returns cached rates if their cache date is the same as the current date', async () => {
    Object.assign(cachedRates, {
      date: new Date().toLocaleDateString('en-us'),
      rates: {},
    });

    const rates = await getRates();
    expect(rates).toBe(cachedRates.rates);
  });

  describe('Gets stored rates when: ', () => {
    afterEach(async () => {
      expect(await getRates()).toEqual(storedRates);
    });

    test('rates havent been cached locally', () => {
      cachedRates.rates = undefined;
    });

    test('local cached rates have a different update date', () => {
      Object.assign(cachedRates, {
        date: '29/02/2000',
        rates: {},
      });
    });
  });
});

const unitMap = units.reduce(function (acc, unit) {
  return { ...acc, [unit.id]: unit };
}, {});

describe('match()', () => {
  test.each([
    ['100.5 usd', [{ usd: 100.5 }]],
    ['199.2 egp 40', [{ egp: 199.2 }]], // Prioritize numbers on the left /
    ['US Dollar', [{ usd: 1 }]], // Matches without numbers. Defautls amount to 1.
    ['$50', [{ usd: 50 }]], // Matches one currency with common labels
    ['20 usdt', []], // Needs space around units
    ['40 - egp', [{ egp: 40 }]], // Allows certain separators between units and amounts1
  ])(
    'Matches currency labels',
    matchTester(currency.match.bind(currency), unitMap)
  );
});

describe('convert():', () => {
  it('Converts currencies according to fetched rates', async () => {
    const inputVector = {
      unit: { id: 'egp' },
      amount: 120,
    };
    const conversions = await currency.convert(inputVector);

    /** Mock rates from {@link storedRates} */
    const expected = [
      { id: 'usd', amount: 4 },
      { id: 'egp', amount: 120 },
      { id: 'gbp', amount: 3.2 },
    ];

    expect(conversions).toEqual(
      expect.arrayContaining(
        expected.map(({ id, amount }) =>
          expect.objectContaining({
            unit: expect.objectContaining({ id }),
            amount,
          })
        )
      )
    );
  });
});

describe('Render Settings', () => {
  /** @type {Awaited<ReturnType<currency['getRenderSettings']>>} */
  let renderSettings;
  beforeEach(async () => {
    renderSettings = await currency.getRenderSettings();
  });
  describe('Unit Templates', () => {
    it('Uses alt symbol + currency names for titles and uppercase IDs for subtitles', () => {
      const { usd } = unitMap;
      expect(renderSettings.unitTemplates.usd).toEqual({
        title: `${usd.symbol.alt} ${usd.name}`,
        subtitle: usd.id.toUpperCase(),
      });
    });
  });
  describe('Default Values', () => {
    it('Returns valid default values for each setting', () => {
      const { mainUnitID, secondaryUnitID, featuredUnitIDs } = renderSettings;
      [mainUnitID, secondaryUnitID, ...featuredUnitIDs].forEach((id) => {
        expect(Object.hasOwn(unitMap, id)).toBeTruthy();
      });
    });
  });
});
