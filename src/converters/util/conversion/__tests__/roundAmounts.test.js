import roundAmounts from '../roundAmounts';

it('Rounds amounts according to the "decimal" setting', async () => {
  const values = [
    { amount: 1.733333, unit: { id: 'usd' } },
    { amount: 0.86666667, unit: { id: 'gbp' } },
  ];

  const tests = [
    { decimal: 2, results: { usd: 1.73, gbp: 0.87 } },
    { decimal: 3, results: { usd: 1.733, gbp: 0.867 } },
  ];

  for (let { decimal, results } of tests) {
    const rounded = roundAmounts(values, decimal);

    expect(rounded).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          amount: results.usd,
        }),
        expect.objectContaining({
          amount: results.gbp,
        }),
      ])
    );
  }
});
