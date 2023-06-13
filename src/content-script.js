import renderConversions from '@render/views/conversion/PageConversions';
import debounce from '@util/selection/debounce';
import mapSelectionIndices from '@util/selection/mapSelectionIndices';

/** @typedef {import('./background').Conversion}  Conversion */

function getMatches() {
  document.removeEventListener('selectionchange', debouncedMatch);

  const listen = () => {
    // Mapping selection string indices to their DOM locations with mapSelectionIndices
    // manipulates the document's selection object, queing selectionchange events.
    // Defer re-observing to a new task to run after the events are flushed.
    setTimeout(() => {
      document.addEventListener('selectionchange', debouncedMatch);
    }, 0);
  };

  const selection = window.getSelection();
  if (selection.isCollapsed) {
    listen();
    return;
  }

  const { string, positions } = mapSelectionIndices(selection);

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

        // Positions are mapped by extending & moving a selection. Some elements 
        // prevent an incoming selection to exntend into or around them (i.e. select
        // elements). The section after those elements isn't mapped, so don't render it.
        if (
          startIndex >= positions.start.length ||
          endIndex > positions.end.length
        ) {
          return [];
        }

        const domRange = new Range();
        domRange.setStart(...positions.start[startIndex]);
        domRange.setEnd(...positions.end[endIndex - 1]);
        return {
          ...conv,
          domRange,
        };
      })
    );

    renderConversions(conversionsToRender);
    listen();
  });
}

const debouncedMatch = debounce(getMatches, 200);
document.addEventListener('selectionchange', debouncedMatch);
