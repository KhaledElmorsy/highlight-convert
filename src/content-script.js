import renderConversions from '@render/views/conversion/PageConversions';
import { debounce, mapSelection } from '@util/selection';

/** @typedef {import('./background').Conversion}  Conversion */

let currentCall = 0;

async function getMatches() {
  // Run only when the mouse is up/released
  if (document.querySelectorAll(':root:active').length) {
    const id = ++currentCall;
    await new Promise((res) => {
      document.addEventListener('mouseup', res, { once: true });
    });
    if (currentCall !== id) return;
  }

  const selection = window.getSelection();

  if (selection.isCollapsed) return;

  const { string, locations } = mapSelection(selection);

  const serviceWorker = chrome.runtime.connect();
  serviceWorker.postMessage({
    type: 'process',
    strings: [string],
  });

  serviceWorker.onMessage.addListener((message) => {
    /** @type {{data: Conversion[][]}} */
    const { data: processedData } = message;

    /** @type {Conversion & {domRange: Range}[]} */
    const conversionsToRender = processedData.flatMap((conversions, i) =>
      conversions.flatMap((conv) => {
        const [startIndex, endIndex] = conv.range;

        const [startPosition, endPosition] = [
          locations[startIndex],
          locations[endIndex - 1],
        ];

        const domRange = new Range();
        domRange.setStart(startPosition.node, startPosition.offset);
        domRange.setEnd(endPosition.node, endPosition.offset + 1);

        return {
          ...conv,
          domRange,
        };
      })
    );

    renderConversions(conversionsToRender);
  });
}

document.addEventListener('selectionchange', debounce(getMatches, 200));
