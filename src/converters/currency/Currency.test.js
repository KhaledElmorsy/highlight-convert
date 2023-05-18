import { getRates, cachedRates } from './Currency';

const storedRates = { usd: 1, egp: 30, gbp: 0.8 };
jest.mock('./controllers', () => ({}));

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

describe('E2E', () => {
  it('Matches and converts currencies', async () => {
    const {default: testConverter} = await import('./Currency')
    const units = {
      egp: { id: 'egp', labels: ['egp'] },
      usd: { id: 'usd', labels: ['usd', '$'] },
      gbp: { id: 'gbp', labels: ['gbp'] },
    };

    testConverter.units = Object.values(units);
    cachedRates.rates = undefined; // Force to fetch get stored rates

    const matches = await testConverter.match('OLED TV: $1999.9');
    expect(matches.length).toBe(1);
    expect(matches[0].value).toEqual(
      expect.objectContaining({ unit: units.usd, amount: 1999.9 })
    );

    const conversions = await matches[0].value.convert();
    expect(conversions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ unit: units.usd, amount: 1999.9 }),
        expect.objectContaining({ unit: units.egp, amount: 1999.9 * 30 }),
        expect.objectContaining({ unit: units.gbp, amount: 1999.9 * 0.8 }),
      ])
    );
  });
});
