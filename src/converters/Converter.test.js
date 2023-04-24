import Converter from './Converter';

/** @satisfies {Object<string, Unit>} */
const mockUnitsMap = {
  dollar: { id: 1, name: 'US Dollar', labels: ['$', 'usd'] },
  pound: { id: 2, name: 'British Pound', labels: ['£', 'gbp'] },
};

const mockUnits = Object.values(mockUnitsMap);

/** @type {Converter} */
let converter;

beforeAll(() => {
  converter = new Converter(mockUnits);
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
    const rightNumConverter = new Converter(mockUnits, { numberSide: 'right' });
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

  it('Filters matches according to Converter.matchFilter()', async () => {
    // Only return a match with 'usd'
    const baseFilter = Converter.prototype.matchFilter;
    Converter.prototype.matchFilter = (match) =>
      match.data.unit === 'usd';

    expect(await converter.match(testString)).toEqual([
      {
        value: expect.objectContaining({
          unit: mockUnitsMap.dollar,
          amount: 10, // Still matches values with only one number, regardless of position
        }),
        range: [0, 6],
      },
    ]);

    Converter.prototype.matchFilter = baseFilter;
  });
});
