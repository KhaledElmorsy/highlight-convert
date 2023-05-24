/**
 * Test a unit matching method.
 * @param {(string: string) => Promise<Match[]>} match 
 * @param {{[id: Unit['id']]: Unit}} unitMap 
 * @returns 
 */
export default function matchTester(match, unitMap) {
  /**
   * @param {string} string
   * @param {{[id: Unit['id']]: number}[]} expected
   */
  return async (string, expectedValues) => {
    expect(await match(string)).toEqual(
      expect.arrayContaining(
        expectedValues.map((value) => {
          const [[id, amount]] = Object.entries(value);
          return expect.objectContaining({
            value: expect.objectContaining({
              unit: unitMap[id],
              amount,
            }),
          });
        })
      )
    );
  };
}
