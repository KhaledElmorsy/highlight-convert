import featureUnits from '../featureUnits';
import mockValues from '../test-utils/mockValues';

it('Puts featured units at the start of the array', () => {
  const featuredUnits = ['jpy', 'gbp', 'cad'].map((id) => ({ id }));

  const outputFeaturedUnits = featureUnits(mockValues, featuredUnits).slice(
    0,
    featuredUnits.length
  );

  expect(outputFeaturedUnits).toEqual(
    expect.arrayContaining(
      featuredUnits.map((unit) => expect.objectContaining({ unit }))
    )
  );
});

it('Returns the same order when passed an empty unit array', () => {
  expect(featureUnits(mockValues, [])).toEqual(mockValues)
})
