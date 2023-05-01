import settings from './settings';
import Currency from './Currency';

const storedRates = { usd: 1, egp: 20 };

jest.mock('./util', () => ({
  ...jest.requireActual('./util'),
  getStoredRates: jest.fn(async () => storedRates),
}));

jest.mock('./settings');

const currencies = {
  egp: { id: 'egp', labels: ['💷', 'egp'] },
  gbp: { id: 'gbp', labels: ['💷', 'gbp'] },
  usd: { id: 'usd', labels: ['$', 'usd'] },
};
const units = Object.values(currencies);

const createCurrency = (inputUnits = units) => {
  const currency = new Currency();
  // Override default units
  currency.units = inputUnits;
  return currency;
};

describe('matchFilter():', () => {
  it('Matches only the default currency with duplicate symbols', async () => {
    const currency = createCurrency();
    const noFilter = await currency.match('💷');
    expect(noFilter.length).toBe(2);

    const defaultUnit = currencies.egp;

    const symbolSetting = {
      symbol: '💷',
      setting: {
        get: async () => defaultUnit,
      },
    };
    settings.duplicateSymbols['💷'] = symbolSetting;

    const matches = await currency.match('💷');
    expect(matches.length).toBe(1);
    expect(matches[0].value.unit).toBe(defaultUnit);
  });
});

describe('convert():', () => {
  jest.spyOn(settings.general.decimal.setting, 'get').mockResolvedValue(0);
  const currency = createCurrency();
  currency.getRates = async () => ({
    gbp: 0.5,
    egp: 30,
    usd: 1,
  });
  
  it('Converts matched currency according to rates object', async () => {
    const conversion = await currency.convert({
      amount: 60,
      unit: currencies.egp,
    });

    expect(conversion).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ amount: 2, unit: currencies.usd }),
        expect.objectContaining({ amount: 1, unit: currencies.gbp }),
        expect.objectContaining({ amount: 60, unit: currencies.egp }),
      ])
    );
  });

  it('Rounds amounts according to the "decimal" setting', async () => {
    const initialValue = {
      amount: 52,
      unit: currencies.egp,
    };

    const tests = [
      { decimal: 2, results: { usd: 1.73, gbp: 0.87 } },
      { decimal: 3, results: { usd: 1.733, gbp: 0.867 } },
    ];

    for (let { decimal, results } of tests) {
      jest
        .spyOn(settings.general.decimal.setting, 'get')
        .mockReturnValue(decimal);

      const conversion = await currency.convert(initialValue);
      expect(conversion).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            amount: results.usd,
            unit: currencies.usd,
          }),
          expect.objectContaining({
            amount: results.gbp,
            unit: currencies.gbp,
          }),
          expect.objectContaining({ amount: 52, unit: currencies.egp }),
        ])
      );
    }
  });
});

describe('getRates():', () => {
  it('Returns cached rates if their cache date is the same as the current date', async () => {
    const currency = createCurrency();
    const cachedRates = {
      date: new Date().toLocaleDateString('en-us'),
      rates: {},
    };
    currency.cachedRates = cachedRates;
    const rates = await currency.getRates();
    expect(rates).toBe(cachedRates.rates);
  });

  describe('Gets stored rates when: ', () => {
    let currency;

    beforeAll(() => {
      currency = createCurrency();
    });

    afterEach(async () => {
      expect(await currency.getRates()).toEqual(storedRates);
    });

    test('local cached rates dont exist', async () => {
      currency.cachedRates = undefined;
    });

    test('local cached rates have a different update date', async () => {
      currency.cachedRates = {
        date: '29/02/2000',
        rates: {},
      };
    });
  });
});
