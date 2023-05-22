import CustomConverter from '@converters/CustomConverter';

const unitMap = {
  a: { id: 'a' },
  b: { id: 'b' },
  c: { id: 'c' },
};
const units = Object.values(unitMap);

describe('constructor()', () => {
  it('Throws if not passed either single or full overrides', () => {
    const convertVector = () => {};
    const convertAll = () => {};
    expect(() => new CustomConverter({ units, convertAll })).not.toThrow();
    expect(() => new CustomConverter({ units, convertVector })).not.toThrow();
    expect(
      () => new CustomConverter({ units, convertAll, convertVector })
    ).not.toThrow();
    expect(() => new CustomConverter({ units })).toThrow();
  });

  it('Overrides respective methods of the same name only when passed', () => {
    const convertVector = () => {};
    const convertAll = () => {};

    const converter = new CustomConverter({
      units,
      convertAll,
      convertVector,
    });

    expect(converter.convertVector).toBe(convertVector);
    expect(converter.convertAll).toBe(convertAll);

    const overrideSingle = new CustomConverter({
      units,
      convertVector,
    });
    expect(overrideSingle.convertVector).toBe(convertVector);
    expect(overrideSingle.convertAll).toBe(
      CustomConverter.prototype.convertAll
    );
  });
});

describe('convert()', () => {
  test.each([
    [{ amount: 20, unit: unitMap.a }],
    [{ amount: 50, unit: unitMap.b }],
    [{ amount: 10, unit: unitMap.c }],
  ])(
    'Converts to each unit using convertVector when passed',
    async (inputVector) => {
      async function convertVector(inputVector, unit) {
        const toA = { a: 1, b: 0.1, c: 0.01 }[inputVector.unit.id];
        const fromA = { a: 1, b: 10, c: 100 }[unit.id];
        return { amount: fromA * toA * inputVector.amount, unit };
      }

      const converter = new CustomConverter({
        units,
        convertVector,
      });
      const conversions = await converter.convert(inputVector);
      const expectedValues = await Promise.all(
        units.map((unit) => convertVector(inputVector, unit))
      );

      expect(conversions).toEqual(
        expect.arrayContaining(
          expectedValues.map((value) => expect.objectContaining(value))
        )
      );
    }
  );

  it('Converts all units with convertAll when passed', async () => {
    const fetchRates = jest.fn(async () => ({ a: 1, b: 10, c: 100 }));
    async function convertAll(inputVector, units) {
      const rates = await fetchRates();
      const scaleFactor = inputVector.amount / rates[inputVector.unit.id];
      return units.map((unit) => ({
        amount: rates[unit.id] * scaleFactor,
        unit,
      }));
    }
    const converter = new CustomConverter({ units, convertAll });
    const inputVector = { amount: 5, unit: unitMap.a };

    const conversions = await converter.convert(inputVector);
    expect(fetchRates).toHaveBeenCalledTimes(1);

    const expectedValues = await convertAll(inputVector, units);
    expect(conversions).toEqual(
      expect.arrayContaining(
        expectedValues.map((value) => expect.objectContaining(value))
      )
    );
  });
});
