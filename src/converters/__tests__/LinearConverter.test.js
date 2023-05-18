import LinearConverter from '../LinearConverter';

describe('constructor()', () => {
  it('Throws when instantiated with neither a rates object or getRates function', () => {
    expect(() => new LinearConverter({units: [], rates: {}})).not.toThrow();
    expect(() => new LinearConverter({units: [], getRates: () => {}})).not.toThrow();
    expect(() => new LinearConverter({units: []})).toThrow();
  })
})

describe('convert():', () => {
  const units = {
    usd: { id: 'usd' },
    egp: { id: 'egp' },
    gbp: { id: 'gbp' },
  };

  const unitArray = Object.values(units);

  let constructorArgs;

  /** @type {Record<keyof units, number>} */
  let expected;

  afterEach(async () => {
    const converter = new LinearConverter({
      units: unitArray,
      ...constructorArgs,
    });
    const conversions = await converter.convert({
      amount: 60,
      unit: units.egp,
    });

    expect(conversions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ amount: expected.usd, unit: units.usd }),
        expect.objectContaining({ amount: expected.gbp, unit: units.gbp }),
        expect.objectContaining({ amount: expected.egp, unit: units.egp }),
      ])
    );
  });

  it('Converts values according to the rates object', () => {
    const rates = {
      egp: 30,
      gbp: 0.5,
      usd: 1,
    };
    constructorArgs = { rates };
    expected = {
      egp: 60,
      gbp: 1,
      usd: 2,
    };
  });

  it('Allows rate generation to be overridden with asynchronous functions', () => {
    async function getRates() {
      return {
        egp: 3,
        gbp: 2,
        usd: 1,
      };
    }
    constructorArgs = { getRates };
    expected = {
      egp: 60,
      gbp: 40,
      usd: 20,
    };
  });
});
