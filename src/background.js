import { Currency } from './converters';

/** @typedef {Match} */

const converters = [Currency];

chrome.runtime.onConnect.addListener((port) => {
  let processedNodes;

  port.onMessage.addListener(async (message) => {
    if (message.type === 'process') {
      const { strings } = message;

      const matchPromiseArrays = strings.map(async (string) => {
        const matches = (
          await Promise.all(converters.map((conv) => conv.match(string)))
        ).flat();

        const conversions = await Promise.all(
          matches.flat().map((match) => match.value.convert())
        );

        return conversions.map((conversion, i) => ({
          conversion,
          match: matches[i],
        }));
      });

      processedNodes = await Promise.all(matchPromiseArrays);

      port.postMessage({
        type: 'processed',
        data: processedNodes,
      });
    }
  });
});
