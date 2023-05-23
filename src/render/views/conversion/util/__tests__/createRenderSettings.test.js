import { MultiPicker, Picker } from '@settings/Controller';
import createRenderSettings from '../createRenderSettings';

jest.mock('@settings/Controller/variants/Picker');
jest.mock('@settings/Controller/variants/MultiPicker');

const unitMap = {
  usd: { id: 'usd', name: 'US Dollar', labels: ['usd'] },
  egp: { id: 'egp', name: 'Egyptian Pound', labels: ['egp'] },
  gbp: { id: 'gbp', name: 'Pound Sterling', labels: ['gbp'] },
  aud: { id: 'aud', name: 'Australian Dollar', labels: ['aud'] },
};

const units = Object.values(unitMap);
const id = 'test';
const mainUnitID = 'usd';
const secondaryUnitID = 'gbp';
const featuredUnitIDs = ['gbp', 'aud'];
const groups = [];
const unitTemplates = {};

let getRenderSettings;
let controllers;

beforeEach(() => {
  ({ getRenderSettings, controllers } = createRenderSettings({
    units,
    id,
    mainUnitID,
    secondaryUnitID,
    featuredUnitIDs,
    groups,
    unitTemplates,
  }));
});

const compactUnits = units.map(({ id, name }) => ({ id, name }));

it('Instantiates controllers for the main, secondary, and featured units', () => {
  const { mainUnit, secondaryUnit, featuredUnits } = controllers;
  const instanceIndex = (target, mockConstructor) =>
    mockConstructor.mock.instances.findIndex((instance) => instance === target);

  const callIndices = {
    mainUnit: instanceIndex(mainUnit, Picker),
    secondaryUnit: instanceIndex(secondaryUnit, Picker),
    featuredUnits: instanceIndex(featuredUnits, MultiPicker),
  };

  const calls = {
    mainUnit: Picker.mock.calls[callIndices.mainUnit],
    secondaryUnit: Picker.mock.calls[callIndices.secondaryUnit],
    featuredUnits: MultiPicker.mock.calls[callIndices.featuredUnits],
  };

  expect(calls.mainUnit[0]).toEqual({
    key: `${id}.mainUnit`,
    area: 'sync',
    options: compactUnits,
    defaultValue: compactUnits.find(({ id }) => id === mainUnitID),
  });

  expect(calls.secondaryUnit[0]).toEqual({
    key: `${id}.secondaryUnit`,
    area: 'sync',
    options: compactUnits,
    defaultValue: compactUnits.find(({ id }) => id === secondaryUnitID),
  });

  expect(calls.featuredUnits[0]).toEqual({
    key: `${id}.featuredUnits`,
    area: 'sync',
    options: compactUnits,
    defaultValue: featuredUnitIDs.map((id) =>
      compactUnits.find(({ id: cID }) => cID === id)
    ),
  });
});

it('Returns a fucntion that generates an object containing the render settings', async () => {
  const { mainUnit, secondaryUnit, featuredUnits } = controllers;
  mainUnit.get.mockResolvedValue(compactUnits.find((u) => u.id === mainUnitID));
  secondaryUnit.get.mockResolvedValue(
    compactUnits.find((u) => u.id === secondaryUnitID)
  );
  featuredUnits.get.mockResolvedValue(
    compactUnits.filter((u) => featuredUnitIDs.includes(u.id))
  );

  const renderSettings = await getRenderSettings();
  expect(renderSettings.groups).toBe(groups);
  expect(renderSettings.unitTemplates).toBe(unitTemplates);
  expect(renderSettings).toEqual(
    expect.objectContaining({
      mainUnitID,
      secondaryUnitID,
      featuredUnitIDs,
    })
  );
});
