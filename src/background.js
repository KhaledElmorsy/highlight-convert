import getDomains from './appDomains';

/** @typedef {Match} */

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (message) => {
    if (message.type === 'process') {
      /** @type {{strings: string[]}} */
      const { strings } = message;
      const domains = await getDomains();

      // Map each string to a set of conversions and their relevant associated data.
      const stringConversions = await Promise.all(strings.map(async (string) => {
        const domainMatches = await Promise.all(
          domains.map((domain) => domain.match(string))
        );

        // Map each match subarray to its `values`, `range`, and its parent domain's 
        // `renderSettings`
        const domainConversions = await Promise.all(
          domainMatches.map(
            async (matchArray, i) =>
              await Promise.all(
                matchArray.map(async (match) => ({
                  inputValue: match.value,
                  range: match.range,
                  renderSettings: await domains[i].getRenderSettings(),
                  values: match.value.convert
                    ? await match.value.convert()
                    : await domains[i].convert(match.value),
                }))
              )
          )
        );

        return domainConversions.flat();
      }));

      port.postMessage({
        type: 'processed',
        data: stringConversions,
      });
    }
  });
});
