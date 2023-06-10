import * as controllers from './Controller';
import * as views from '@render/views/controllers';
import StorageEvents from '@util/chrome/storage/StorageEvents';

/**
 * @typedef {keyof views} ViewName
 * @typedef {keyof controllers} ControllerName
 */

/**
 * @template Value
 * @typedef {import('@render/views/controllers/typedefs').ControllerViewFactory<Value>} ControllerViewFactory
 */

/**
 * @template Value
 * @typedef {import('./Controller/Controller').default<Value>} Controller
 */

/**
 * @template {Controller} C
 * @typedef {C extends Controller<infer Value> ? Value : never} GetControllerValue
 */

/**
 * @template {string} ViewName
 * @typedef {Parameters<views[ViewName]>['0']['settings']} ViewSettings
 */

/**
 * @typedef {{classes?: string[]}} ViewClasses Add classes to the view element
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
 * @template {Controller<any>} ControllerInstance
 * @template {ControllerInstance['_controllerType']} ControllerType
 * @template {CompatibleViews[ControllerType][number]} View
 * @template {GetControllerValue<ControllerInstance>} Value
 *
 * @param {object} args
 * @param {ControllerInstance} args.controller
 * @param {View} [args.viewType] The view to render the controller with.
 * @param {ViewSettings<View> & ViewClasses} [args.viewSettings] View configuration.
 */
export default function createControllerView({
  controller,
  viewType,
  viewSettings = {},
}) {
  const defaultViewType = CompatibleViews[controller._controllerType][0];

  /** @type {ControllerViewFactory<Value>} */
  const baseView = views[viewType ?? defaultViewType];

  const { classes } = viewSettings;

  return async function createElement() {
    const controllerValue = await controller.get();

    /**
     * Get current stored value and update the view with it.
     * 
     * Some views can't interrupt user changes, causing a potential mismatch between
     * it and the model since the model can't fully control the view's value.
     * Call this after changes to fix potential mismatches.
     * @param {import('@render/views/controllers/typedefs').ControllerView<unknown>} controllerView 
     */
    async function updateViewFromModel(controllerView) {
      const value = await controller.get();
      controllerView.setValue(value);
    }

    const controllerView = baseView({
      options: controller.options,
      value: controllerValue,
      onChange: (newVal) => {
        controller.set(newVal);
        setTimeout(updateViewFromModel, 0, controllerView); // Update to actual current model value
      },
      settings: viewSettings,
    });

    if (classes) {
      controllerView.classList.add(
        ...(Array.isArray(classes) ? classes : [classes]) // Avoid silently spreading passed strings.
      ); // This mistake happens when passing only one class
    }

    // Update render views when the stored value changes
    const { key, area } = controller.storage;
    StorageEvents.observe(area, key, ({ newValue }) => {
      controllerView.setValue(newValue);
    });

    return controllerView;
  };
}
