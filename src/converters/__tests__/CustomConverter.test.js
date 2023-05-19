import CustomConverter from '@converters/CustomConverter';

describe('convert()', () => {
  const units = {
    a: { id: 'a' },
    b: { id: 'b' },
    c: { id: 'c' },
  };
  const unitArray = Object.values(units);
  test.each([
    [{ amount: 20, unit: units.a }],
    [{ amount: 50, unit: units.b }],
    [{ amount: 10, unit: units.c }],
  ])(
    'Converts results based on the passed, potentially async, conversion function',
    async (inputValue) => {
      async function convertValue({ amount, unit }) {
        return unitArray.map(({ id }) => {
          if (id === unit.id) return { amount, unit };
          return { amount: amount * 100, unit };
        });
      }
      
      const converter = new CustomConverter({ units: unitArray, convertValue });
      const conversions = await converter.convert(inputValue);
      const expectedValues = await convertValue(inputValue);

      expect(conversions).toEqual(
        expect.arrayContaining(
          expectedValues.map((value) => expect.objectContaining(value))
        )
      );
    }
  );
});
