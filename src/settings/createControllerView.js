import * as controllers from './Controller';
import * as views from '@render/views/controllers';

/**
 * @typedef {keyof views} ViewName
 * @typedef {keyof controllers} ControllerName
 */

/**
 * @template V
 * @typedef {Parameters<views[V]>['0']['settings']} ViewSettings<V>
 */

/**
 * @typedef {{classes?: string[]} ViewClasses Add classes to the view element
 */

/** @satisfies {Object<ControllerName, ViewName[]>} */
const CompatibleViews = /** @type {const} */ ({
  MultiPicker: ['comboBox'],
  Picker: ['comboBox', 'picker'],
  Toggle: ['toggle'],
  Range: ['range'],
});

/**
 * Get a preset element generator for a specific controller.
 *
 * @template {Controller} C
 * @template {C['_controllerType']} CType
 * @template {CompatibleViews[CType][number]} V
 *
 * @param {object} args
 * @param {C} args.controller
 *
 * @param {V} [args.viewType] The view to render the controller with.
 * @param {ViewSettings<V>} [args.viewSettings] View configuration.
 * @param {}
 */
export default function createControllerView({
  controller,
  viewType,
  viewSettings,
}) {
  const defaultViewType = CompatibleViews[controller._controllerType][0];
  const baseView = views[viewType ?? defaultViewType];

  const { view: viewClasses } =
    viewSettings.classes ?? {};

  return async function createElement() {
    const controllerValue = await controller.get();
  
    /** @type {ControllerView} */
    const controllerView = baseView({
      options: controller.options,
      value: controllerValue,
      onChange: (newVal) => controller.set(newVal),
      settings: viewSettings,
    });

    if (viewClasses) controllerView.classList.add(...viewClasses);

    return controllerView;
  };
}
