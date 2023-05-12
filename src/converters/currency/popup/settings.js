import controllers from '../controllers';
import createControllerView from '@settings/createControllerView';
import { multiLevelPicker } from '@render/views/containers/';

const {
  mainCurrency,
  foreignCurrency: secondCurrency,
  decimals,
  labelDefaults: duplicateSymbols,
  featuredCurrencies,
} = controllers;

/** @type {import('@render/views/controllers/combBox').ComboBoxSettings} */
const currencyComboBoxSettings = {
  keys: { sub: 'id' }, // Render currency code in second column
  mapOptions: ({ name, id, symbol }) => ({
    name,
    id: `${id.toUpperCase()} ${symbol}`,
  }),
};

const dupeSymbolMultiPicker = async () => {
  const pickerTree = Object.fromEntries(
    Object.entries(duplicateSymbols).map(([symbol, controller]) => [
      symbol,
      createControllerView({
        controller,
        viewSettings: currencyComboBoxSettings,
      }),
    ])
  );

  return await multiLevelPicker(pickerTree, (view) => view());
};

export default [
  {
    title: 'General',
    views: [
      {
        label: 'Decimal places',
        view: createControllerView({
          controller: decimals,
          viewSettings: {
            showTooltip: false,
          },
        }),
      },
      {
        label: 'Main currency',
        description: 'Convert other currencies to this.',
        view: createControllerView({
          controller: mainCurrency,
          viewSettings: currencyComboBoxSettings,
        }),
      },
      {
        label: 'Foreign currency',
        description: 'Convert your main currency to this',
        view: createControllerView({
          controller: secondCurrency,
          viewSettings: currencyComboBoxSettings,
        }),
      },
    ],
  },
  {
    title: 'Extra',
    views: [
      {
        label: 'Symbol defaults',
        description: 'Choose the default currency for common symbols',
        view: dupeSymbolMultiPicker,
      },
      {
        label: 'Featured currencies',
        description: 'Show these currencies at the top',
        view: createControllerView({
          controller: featuredCurrencies,
          viewSettings: { multi: true, ...currencyComboBoxSettings },
        }),
      },
    ],
  },
];
