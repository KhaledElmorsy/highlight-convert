import Currency from './Currency';

const storedRates = { usd: 1, egp: 30, gbp: 0.8 };
jest.mock('./controllers', () => ({}));

jest.mock('./util', () => ({
  ...jest.requireActual('./util'),
  getStoredRates: jest.fn(async () => storedRates),
}));

/** @type {Currency} */
let testConverter;
beforeEach(() => {
  testConverter = Object.assign(Currency);
});

describe('getRates():', () => {
  it('Returns cached rates if their cache date is the same as the current date', async () => {
    const cachedRates = {
      date: new Date().toLocaleDateString('en-us'),
      rates: {},
    };
    testConverter.cachedRates = cachedRates;
    const rates = await testConverter.getRates();
    expect(rates).toBe(cachedRates.rates);
  });

  describe('Gets stored rates when: ', () => {
    afterEach(async () => {
      expect(await testConverter.getRates()).toEqual(storedRates);
    });

    test('local cached rates dont exist', async () => {
      testConverter.cachedRates = undefined;
    });

    test('local cached rates have a different update date', async () => {
      testConverter.cachedRates = {
        date: '29/02/2000',
        rates: {},
      };
    });
  });
});

describe('E2E', () => {
  it('Matches and converts currencies', async () => {
    const units = {
      egp: { id: 'egp', labels: ['egp'] },
      usd: { id: 'usd', labels: ['usd', '$'] },
      gbp: { id: 'gbp', labels: ['gbp'] },
    };

    testConverter.units = Object.values(units);
    testConverter.cachedRates = {}; // Force to get stored rates

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
