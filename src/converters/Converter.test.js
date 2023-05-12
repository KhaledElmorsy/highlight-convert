import Converter from './Converter';

/** @satisfies {Object<string, Unit>} */
const mockUnitsMap = {
  dollar: { id: 1, name: 'US Dollar', labels: ['$', 'usd'] },
  pound: { id: 2, name: 'British Pound', labels: ['£', 'gbp'] },
};

const mockUnits = Object.values(mockUnitsMap);

/** @type {Converter} */
let converter;

beforeEach(() => {
  converter = new Converter({units: mockUnits});
});

describe('match():', () => {
  const testString = '10 usd or maybe 10.09 gbp or 50$ 10 or just £';
  it('Returns an array of matched values (unit & amount) and their index ranges', async () => {
    expect(await converter.match(testString)).toEqual(
      expect.arrayContaining([
        {
          value: expect.objectContaining({
            unit: mockUnitsMap.dollar,
            amount: 10,
          }),
          range: [0, 6],
        },
        {
          value: expect.objectContaining({
            unit: mockUnitsMap.pound,
            amount: 10.09,
          }),
          range: [16, 25],
        },
        {
          value: expect.objectContaining({
            unit: mockUnitsMap.dollar,
            amount: 50, // Prioritizes number on the left by default
          }),
          range: [29, 32],
        },
        {
          value: expect.objectContaining({
            unit: mockUnitsMap.pound,
            amount: 1, // Defaults to 1 unit if no number is parsed
          }),
          range: [44, 45],
        },
      ])
    );
  });

  it('Prioritizes number on the right if option is set', async () => {
    const rightNumConverter = new Converter({
      units: mockUnits,
      options: { numberSide: 'right' }}
    );
    expect(await rightNumConverter.match(testString)).toEqual(
      expect.arrayContaining([
        {
          value: expect.objectContaining({
            unit: mockUnitsMap.dollar,
            amount: 10, // 50$ 10 -> prioritize 10 on the right
          }),
          range: [31, 35],
        },
        {
          value: expect.objectContaining({
            unit: mockUnitsMap.dollar,
            amount: 10, // Still matches values with only one number, regardless of position
          }),
          range: [0, 6],
        },
      ])
    );
  });

  it('Filters matches according to Converter.filterMatches()', async () => {
    // Only return a match with 'usd'
    converter.filterMatches = (match) => match.data.unit === 'usd';

    expect(await converter.match(testString)).toEqual([
      expect.objectContaining({
        value: expect.objectContaining({
          unit: mockUnitsMap.dollar,
        }),
      }),
    ]);
  });

  describe('controllers:', () => {
    describe('labelDefaults (shared labels)', () => {
      const unitMap = {
        egp: { id: 'egp', labels: ['💷', 'egp'] },
        gbp: { id: 'gbp', labels: ['💷', 'gbp'] },
        usd: { id: 'usd', labels: ['$', 'usd'] },
      };

      beforeEach(() => (converter = new Converter({units: Object.values(unitMap)})));
      it('matches labels based on the specified default units', async () => {
        converter.controllers.labelDefaults = {
          '💷': { get: async () => unitMap.gbp },
        };
        const matches = await converter.match('20 💷');
        expect(matches.length).toBe(1);
        expect(matches[0].value.unit).toBe(unitMap.gbp);
      });
    });
  });
});

describe('convert():', () => {
  const units = {
    usd: { id: 'usd' },
    egp: { id: 'egp' },
    gbp: { id: 'gbp' },
  };

  beforeEach(() => {
    converter = new Converter({units: Object.values(units)});
    converter.rates = {
      gbp: 0.5,
      egp: 30,
      usd: 1,
    };
  });

  it('Converts matched currencyConverter according to rates object', async () => {
    const conversions = await converter.convert({
      amount: 60,
      unit: units.egp,
    });

    expect(conversions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ amount: 2, unit: units.usd }),
        expect.objectContaining({ amount: 1, unit: units.gbp }),
        expect.objectContaining({ amount: 60, unit: units.egp }),
      ])
    );
  });

  describe('controllers:', () => {
    describe('decimals:', () => {
      it('Rounds amounts according to current controller value', async () => {
        const initialValue = {
          amount: 52,
          unit: units.egp,
        };

        const tests = [
          { decimal: 2, results: { usd: 1.73, gbp: 0.87 } },
          { decimal: 3, results: { usd: 1.733, gbp: 0.867 } },
        ];

        for (let { decimal, results } of tests) {
          converter.controllers.decimals = {
            get: async () => decimal,
          };
          const conversion = await converter.convert(initialValue);
          expect(conversion).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                amount: results.usd,
                unit: units.usd,
              }),
              expect.objectContaining({
                amount: results.gbp,
                unit: units.gbp,
              }),
              expect.objectContaining({ amount: 52, unit: units.egp }),
            ])
          );
        }
      });
    });

    describe('Result order', () => {
      const units = [
        { id: 'egp' },
        { id: 'eur' },
        { id: 'usd' },
        { id: 'gbp' },
        { id: 'jpy' },
        { id: 'aed' },
      ];

      beforeEach(() => {
        converter = new Converter({units});
        converter.getRates = async () =>
          Object.fromEntries(units.map(({ id }) => [id, 1]));
      });

      describe('mainUnit, secondUnit:', () => {
        it('Puts the main/second units the start of the results array', async () => {
          // Convert from main currency -> secondary currency first
          // Convert from any other currency -> main currency first
          const mainUnit = { id: 'jpy' };
          const secondUnit = { id: 'gbp' };
          converter.controllers.mainUnit = { get: async () => mainUnit };
          converter.controllers.secondUnit = { get: async () => secondUnit };

          for (let unit of units) {
            const conversions = await converter.convert({
              amount: 1,
              unit,
            });

            if (unit.id !== mainUnit.id) {
              expect(conversions[0].unit.id).toBe(mainUnit.id);
            } else {
              expect(conversions[0].unit.id).toBe(secondUnit.id);
            }
          }
        });
      });

      describe('featured units:', () => {
        it('Puts featured units at the start of the array', async () => {
          const featured = ['jpy', 'gbp', 'aed'];
          converter.controllers.featuredUnits = {
            get: async () => featured.map((id) => ({ id })),
          };

          const conversions = await converter.convert({
            amount: 1,
            unit: { id: 'jpy' },
          });

          const topResults = conversions.slice(0, 3);
          expect(topResults).toEqual(
            expect.arrayContaining([
              ...featured.map((id) =>
                expect.objectContaining({
                  unit: expect.objectContaining({ id }),
                })
              ),
            ])
          );
        });
      });
    });
  });
});
