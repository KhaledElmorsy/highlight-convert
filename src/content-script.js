import renderConversions from '@render/views/conversion/PageConversions';
import { getVisibleTextRanges, getInnerRange } from '@util/selection';
import debounce from '@util/selection/debounce';

/** @typedef {import('./background').Conversion}  Conversion */

function getMatches() {
  const selection = window.getSelection();
  if (selection.isCollapsed) return;

  const selectedRange = selection.getRangeAt(0);
  const visibleRanges = getVisibleTextRanges(selectedRange);

  const serviceWorker = chrome.runtime.connect();

  serviceWorker.postMessage({
    type: 'process',
    strings: visibleRanges.map((r) => r.toString()),
  });

  serviceWorker.onMessage.addListener((message) => {
    /** @type {{data: Conversion[][]}} */
    const { data: processedData } = message;

    /** @type {Conversion & {domRange: Range}[]} */
    const conversionsToRender = processedData.flatMap((conversions, i) =>
      conversions.map((conv) => ({
        ...conv,
        domRange: getInnerRange(visibleRanges[i], conv.range[0], conv.range[1]),
      }))
    );

    renderConversions(conversionsToRender);
  });
}

document.addEventListener('selectionchange', debounce(getMatches, 400));
