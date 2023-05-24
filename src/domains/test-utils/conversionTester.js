export default function conversionTester(converter, unitMap) {
  return async (input, expected) => {
    const inputVector = Object.entries(input).reduce(
      (_, [id, amount]) => ({
        amount,
        unit: unitMap[id],
      }),
      null
    );

    const conversions = await converter.convert(inputVector);
    conversions.forEach(({ amount, unit }) => {
      expect(amount).toBe(expected[unit.id]);
    });
  };
}
