import Converter from '../Converter';

/** @satisfies {Object<string, Unit>} */
const mockUnitsMap = {
  dollar: { id: 1, name: 'US Dollar', labels: ['$', 'usd'] },
  pound: { id: 2, name: 'British Pound', labels: ['£', 'gbp'] },
};

const mockUnits = Object.values(mockUnitsMap);

/** @type {Converter} */
let converter;

beforeEach(() => {
  converter = new Converter({ units: mockUnits });
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
      options: { numberSide: 'right' },
    });
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

  it('Optionally performs case sensetive label matching', async () => {
    const string = 'match 100 usd not 100 USD';
    const exactConverter = new Converter({
      units: mockUnits,
      options: { caseSensitive: true },
    });
    const matches = await exactConverter.match(string);
    expect(matches.length).toBe(1);
    expect(matches[0].range[0]).toBe(6);
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

      beforeEach(
        () => (converter = new Converter({ units: Object.values(unitMap) }))
      );
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
  describe('controllers:', () => {
    describe('decimals:', () => {
      it('Rounds amounts according to current controller value', async () => {
        const units = {
          usd: { id: 'usd' },
          gbp: { id: 'gbp' },
        };

        converter.convertValue = async () => [
          { amount: 1.733333, unit: units.usd },
          { amount: 0.866667, unit: units.gbp },
        ];

        const tests = [
          { decimal: 2, results: { usd: 1.73, gbp: 0.87 } },
          { decimal: 3, results: { usd: 1.733, gbp: 0.867 } },
        ];

        for (let { decimal, results } of tests) {
          converter.controllers.decimals = {
            get: async () => decimal,
          };
          const conversion = await converter.convert();
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
            ])
          );
        }
      });
    });

    describe('Result order', () => {
      const units = {
        egp: { id: 'egp' },
        eur: { id: 'eur' },
        usd: { id: 'usd' },
        gbp: { id: 'gbp' },
        jpy: { id: 'jpy' },
        aed: { id: 'aed' },
      };

      const unitArray = Object.values(units);

      beforeEach(() => {
        converter = new Converter({ units });
        converter.convertValue = async () =>
          unitArray.map((unit) => ({
            amount: 1,
            unit,
          }));
      });

      describe('mainUnit, secondUnit:', () => {
        it('Puts the main/second units at the beginning of the results array', async () => {
          // Converting from main unit -> put secondary unit first
          // Converting from any other unit -> put main unit first
          const mainUnit = units.jpy;
          const secondUnit = units.gbp;
          converter.controllers.mainUnit = { get: async () => mainUnit };
          converter.controllers.secondUnit = { get: async () => secondUnit };

          for (let unit of unitArray) {
            const conversions = await converter.convert({
              amount: 1,
              unit,
            });

            if (unit !== mainUnit) {
              expect(conversions[0].unit).toBe(mainUnit);
            } else {
              expect(conversions[0].unit).toBe(secondUnit);
            }
          }
        });
      });

      describe('featured units:', () => {
        it('Puts featured units at the beginning of the results array', async () => {
          const featuredUnits = [units.jpy, units.gbp, units.aed];
          converter.controllers.featuredUnits = {
            get: async () => featuredUnits,
          };

          for (let convertTarget of [units.usd, units.jpy]) {
            const conversions = await converter.convert({
              amount: 1,
              unit: convertTarget,
            });

            const featuredValues = conversions.slice(0, featuredUnits.length);
            expect(featuredValues).toEqual(
              expect.arrayContaining([
                ...featuredUnits.map((unit) =>
                  expect.objectContaining({
                    unit,
                  })
                ),
              ])
            );
          }
        });

        it('Puts main/second unit before featured units when both are defined', async () => {
          const mainUnit = units.usd;
          const secondUnit = units.egp;
          const featuredUnits = [units.jpy, units.gbp, units.aed];

          const controllerValues = {
            mainUnit,
            secondUnit,
            featuredUnits,
          };

          Object.keys(controllerValues).forEach((controller) => {
            converter.controllers[controller] = {
              get: async () => controllerValues[controller],
            };
          });

          for (let convertTarget of [
            units.usd,
            units.egp,
            units.jpy,
            units.eur,
          ]) {
            const conversions = await converter.convert({
              amount: 1,
              unit: convertTarget,
            });

            const topUnit = convertTarget === mainUnit ? secondUnit : mainUnit;
            expect(conversions.slice(0, featuredUnits.length + 1)).toEqual(
             
              expect.arrayContaining([
                expect.objectContaining({ unit: topUnit }),
                ...featuredUnits.map((unit) => expect.objectContaining({ unit }))
              ]
              ),
            );
          }
        });
      });
    });
  });
});
