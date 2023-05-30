import { domainPicker, domainNames } from '@/appDomains';
import { withChangeListener } from '@settings/compose';
import { Toggle } from '@settings/Controller';
import { mapKeys } from '@util/chrome/storage';
import createControllerView from '@settings/createControllerView';

const mapKey = mapKeys.new('global.domains');

/**
 * An object mapping domain names to a toggle element that includes/excludes them
 * from the main {@link domainPicker domain picker}
 * @type {{[domainName: string]: () => Promise<HTMLElement>}}
 */
const domainToggles = domainNames.reduce((acc, domainName) => {
  const controller = withChangeListener(
    new Toggle({
      area: 'sync',
      key: mapKey(`toggles.${domainName}`),
      defaultValue: true,
    })
  );

  controller.addListener(async (newValue) => {
    const currentDomains = new Set(await domainPicker.get());
    currentDomains[newValue ? 'add' : 'delete'](domainName);
    await domainPicker.set([...currentDomains]);
  });

  acc[domainName] = createControllerView({ controller });

  return acc;
}, {});

export default domainToggles;
