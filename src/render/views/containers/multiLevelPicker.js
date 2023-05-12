import { picker } from '../controllers';
import { createElement, replaceElementAt } from '@render/util';
import styles from './styles/multiLevelPicker.module.scss';

/**
 * @typedef {object} MultiLevelPickerSettings
 * @prop {object} [classes] Add classes to child elements
 * @prop {string} [classes.picker] Intermediate pickers
 * @prop {string} [classes.node] Outer elements
 * @prop {string} [classes.container] Container
 */

/**
 * Render an option heirarchy as a set of sequential pickers.
 *
 * This view is purely visual. Functionality should be handled by the leaf nodes.
 * @param {object} tree Heirarchy of options. Ensure leaf node are DOM nodes.
 * @param {(node: any) => Promise<HTMLElement>} [getNode] Transform the leaf node to an HTML element.
 *
 * Asynchronous since nodes can be views which asynchronously pull their data from Chrome's storage.
 * @param {MultiLevelPickerSettings} settings
 * @returns {Promise<HTMLElement>}
 */
export default function multiLevelPicker(
  tree,
  getNode = (n) => n,
  {
    classes: {
      container: containerClass = styles.container,
      picker: pickerClass = styles.picker,
      node: nodeClass = styles.node,
    } = {},
  } = {}
) {
  const container = createElement('div', { class: containerClass });

  async function createTree(node, level) {
    if (`${node}` !== '[object Object]') {
      const nodeEl = await getNode(node);
      nodeEl.classList.add(nodeClass);
      replaceElementAt(nodeEl, level, container);
      return;
    }

    const options = Object.keys(node);

    function changePick(newOption) {
      const subTree = node[newOption];
      createTree(subTree, level + 1);
    }

    const pickerEl = picker({
      options,
      value: options[0],
      onChange: changePick,
    });
    pickerEl.classList.add(pickerClass);

    replaceElementAt(pickerEl, level, container);

    const subTree = node[options[0]];
    createTree(subTree, level + 1);
  }

  createTree(tree, 0);
  return container;
}
