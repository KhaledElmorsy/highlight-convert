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
  it('Returns an array of matched values (unit, amount, convert()) and their index ranges', async () => {
    expect(await converter.match(testString)).toEqual(
      expect.arrayContaining([
        {
          value: {
            unit: mockUnitsMap.dollar,
            amount: 10,
            convert: expect.any(Function),
          },
          range: [0, 6],
        },
        {
          value: {
            unit: mockUnitsMap.pound,
            amount: 10.09,
            convert: expect.any(Function),
          },
          range: [16, 25],
        },
        {
          value: {
            unit: mockUnitsMap.dollar,
            amount: 50, // Prioritizes number on the left by default
            convert: expect.any(Function),
          },
          range: [29, 32],
        },
        {
          value: {
            unit: mockUnitsMap.pound,
            amount: 1, // Defaults to 1 unit if no number is parsed
            convert: expect.any(Function),
          },
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

  describe('Matches fraction amounts', () => {
    it.each([
      ['Forward slash', { string: '1/2 usd', amount: 0.5, range: [0, 7] }],
      [
        'Forward slash: negative',
        { string: '-1/2 usd', amount: -0.5, range: [0, 8] },
      ],
      [
        'Forward slash: mixed number',
        { string: '3 1/2 usd', amount: 3.5, range: [0, 9] },
      ],
      [
        'Forward slash: negative mixed number',
        { string: '-10 1/2 usd', amount: -10.5, range: [0, 11] },
      ],
      ['Vulgar fraction', { string: '½ usd', amount: 0.5, range: [0, 5] }],
      [
        'Vulgar fraction: negative',
        { string: '-½ usd', amount: -0.5, range: [0, 6] },
      ],
      [
        'Vulgar fraction: mixed number (space separated)',
        { string: '10 ½ usd', amount: 10.5, range: [0, 8] },
      ],
      [
        'Vulgar fraction: mixed number (adjacent)',
        { string: '3½ usd', amount: 3.5, range: [0, 6] },
      ],
      [
        'Vulgar fraction: negative mixed number',
        { string: '-10 ½ usd', amount: -10.5, range: [0, 9] },
      ],
    ])('%s', async (_, { string, amount, range }) => {
      expect(await converter.match(string)).toEqual([
        expect.objectContaining({
          value: expect.objectContaining({
            unit: mockUnitsMap.dollar,
            amount,
          }),
          range,
        }),
      ]);
    });
  });

  describe('Matches numbers with thousands separator (commas)', () => {
    describe.each([
      ['Positive', { negative: false }],
      ['Negative', { negative: true }],
    ])('%s numbers: ', (_, { negative }) => {
      test.each([
        ['Integers', { string: '1,000 usd', amount: 1000, range: [0, 9] }],
        [
          'Decimals',
          { string: '1,000.59 usd', amount: 1000.59, range: [0, 12] },
        ],
        [
          'Multiple separators',
          { string: '1,000,500 usd', amount: 1000500, range: [0, 13] },
        ],
      ])('%s', async (_, { string, amount, range }) => {
        expect(await converter.match((negative? '-' : '') + string)).toEqual([
          expect.objectContaining({
            value: expect.objectContaining({
              amount: amount * (negative ? -1 : 1),
            }),
            range: [range[0], range[1] + (negative ? 1 : 0)],
          }),
        ]);
      });
    });
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
    converter.filterMatches = (match) => match.data.label === 'usd';

    expect(await converter.match(testString)).toEqual([
      expect.objectContaining({
        value: expect.objectContaining({
          unit: mockUnitsMap.dollar,
        }),
      }),
    ]);
  });

  it('Optionally ignores matched labels not next to numbers', async () => {
    const withNumberConverter = new Converter({
      units: mockUnits,
      options: { numberRequired: true },
    });
    const string = 'For 100 usd - gbp';
    const defaultMatches = await converter.match(string);
    expect(defaultMatches.length).toBe(2);

    const matchesWithNumbers = await withNumberConverter.match(string);
    expect(matchesWithNumbers.length).toBe(1);

    const match = matchesWithNumbers[0];
    expect(match.range[0]).toBe(4);
    expect(match.value.unit).toBe(mockUnitsMap.dollar);
  });

  describe('labelDefaults (shared labels)', () => {
    const unitMap = {
      egp: { id: 'egp', labels: ['£', 'egp'] },
      gbp: { id: 'gbp', labels: ['£', 'gbp'] },
      usd: { id: 'usd', labels: ['$', 'usd'] },
    };

    beforeEach(
      () => (converter = new Converter({ units: Object.values(unitMap) }))
    );
    it('matches labels based on the specified default units', async () => {
      converter.labelDefaults = {
        '£': async () => unitMap.gbp.id,
      };
      const matches = await converter.match('20 £');
      expect(matches.length).toBe(1);
      expect(matches[0].value.unit).toBe(unitMap.gbp);
    });
  });
});

describe('convertAll()', () => {
  it('Converts the input vector to each unit with convertVector() and returns an array with the results', async () => {
    converter.convertVector = jest.fn(async (vector, unit) => ({
      unit,
      amount: 1,
    }));

    const inputVector = {
      amount: 10,
      unit: mockUnitsMap.dollar,
    };

    const conversions = await converter.convert(inputVector);

    mockUnits.map((unit, i) => {
      expect(converter.convertVector).toHaveBeenNthCalledWith(
        i + 1,
        inputVector,
        unit
      );
    });

    expect(conversions).toEqual(
      expect.arrayContaining(
        mockUnits.map((unit) => expect.objectContaining({ unit, amount: 1 }))
      )
    );
  });
});

describe('convert():', () => {
  it('Returns an array of value objects, each with a "convert" method', async () => {
    converter.convertVector = (_, unit) => ({ unit, amount: 1 });
    const values = await converter.convert({ amount: 1, unit: mockUnits[1] });
    expect(values).toEqual(
      Object.values(mockUnitsMap).map((unit) =>
        expect.objectContaining({
          unit,
          amount: 1,
          convert: expect.any(Function),
        })
      )
    );
  });
});
