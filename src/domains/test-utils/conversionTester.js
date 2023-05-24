/** @typedef {{[unitID: Unit['id']]: number}} CompactVector An object mapping `{unit.id: amount}` */

/**
 * Return a function mapped to a set of units and a `convert` function that asserts
 * the correctness of passed conversion tests.
 * @param {(value: ValueVector<Unit>) => Promise<ValueVector<Unit>[]>} convert Convert function to test
 * @param {{[id in Unit['id']]: Unit}} unitMap Object of units to test, mapped to their IDs
 */
export default function conversionTester(convert, unitMap) {
  /**
   * @param {CompactVector} input An object with the input unit ID mapped to the input
   * amount.
   *
   * i.e. `{usd: 100}`
   * @param {CompactVector} expected An object mapping multiple unit Ids to the
   * expected converted amounts.
   *
   * i.e. `{usd: 100, egp: 3000, gbp: 80}`
   */
  return async (input, expected) => {
    const inputVector = Object.entries(input).reduce(
      (_, [id, amount]) => ({
        amount,
        unit: unitMap[id],
      }),
      null
    );

    const conversions = await convert(inputVector);
    conversions.forEach(({ amount, unit }) => {
      const expectedAmount = expected[unit.id];
      // Work around float comparisons. 
      // expect().toBeCloseTo()  simulates rounding at a certain point so it 
      // wouldnt work well for really small values without losing its effectiveness
      // for the majority of other values.
      // i.e. 0.000000014585 vs. 3.00000004
      const errorMargin = Math.abs(expectedAmount / 10000);
      expect(Math.abs(amount - expectedAmount)).toBeLessThanOrEqual(
        errorMargin
      );
    });
  };
}
