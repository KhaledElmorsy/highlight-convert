import { getIntersectingTextNodes } from '@util/selection';
import renderConversions from '@render/views/conversion/PageConversions';

import debounce from '@util/selection/debounce';

function getMatches() {
  const selection = window.getSelection();
  if (selection.isCollapsed) return;

  const selectedRange = selection.getRangeAt(0);
  const textNodes = getIntersectingTextNodes(selectedRange);

  const serviceWorker = chrome.runtime.connect();

  serviceWorker.postMessage({
    type: 'process',
    strings: textNodes.map(({ nodeValue }) => nodeValue),
  });

  serviceWorker.onMessage.addListener((message) => {
    const { data: processedData } = message;
    const nodeConversions = processedData.map((conversions, i) => ({
      node: textNodes[i],
      conversions,
    }));

    const conversionsToRender = nodeConversions.flatMap(
      ({ node, conversions }) => {
        return conversions.flatMap((conversion) => {
          const conversionRange = new Range();
          const [start, end] = conversion.range;
          conversionRange.setStart(node, start);
          conversionRange.setEnd(node, end);

          const insideSelection =
            conversionRange.compareBoundaryPoints(1, selectedRange) >= 0 && // 1: Range.START_START
            conversionRange.compareBoundaryPoints(2, selectedRange) <= 0; // 2: Range.END_END

          if (!insideSelection) return [];
          conversion.domRange = conversionRange;
          return conversion;
        });
      }
    );
    renderConversions(conversionsToRender);
  });
}

document.addEventListener('selectionchange', debounce(getMatches, 400));
