import moveMainUnits from '../moveMainUnit';
import mockValues from '../test-utils/mockValues';

it('Puts the main/second units the start of the values array', async () => {
  // If the input value is the main unit, move the second unit
  // Otherwise, move the main unit
  const mainUnit = { id: 'aed' };
  const secondUnit = { id: 'gbp' };

  for (let value of mockValues) {
    const sortedvalues = moveMainUnits(mockValues, value, mainUnit, secondUnit);
    if (value.unit.id !== mainUnit.id) {
      expect(sortedvalues[0].unit.id).toBe(mainUnit.id);
    } else {
      expect(sortedvalues[0].unit.id).toBe(secondUnit.id);
    }
  }
});

it('Doesnt move values if the main unit was being converted but a secondary unit wasnt passed', () => {
  const noSecondUnit = (inputValue) =>
    moveMainUnits(mockValues, inputValue, { id: 'jpy' });

  expect(noSecondUnit({ unit: { id: 'egp' } })[0].unit.id).toBe('jpy');
  expect(noSecondUnit({ unit: { id: 'jpy' } })[0].unit.id).toEqual(
    mockValues[0].unit.id
  );
});
