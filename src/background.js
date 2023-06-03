import getDomains from './appDomains';

/** 
 * @typedef Conversion
 * @prop {number} domainID Different between source domains. Doesn't actually identify the domain.
 * @prop {ValueVector} inputValue The matched value
 * @prop {[number, number]} range Start and end (excl.) indices of the match in the input string.
 * @prop {ConversionRenderSettings} renderSettings Settings passed by the domain to customize rendering
 * @prop {ValueVector[]} values An array of values converted from the matched value.
 */

/**
 * Match a string against multiple domains and return an array of objects containing
 * each match's data, data from the source domain, and match's converted values.
 * @param {string} string
 * @param {Domain<Unit>[]} domains
 * @returns {Promise<Conversion[]>}
 */
async function getConversions(string, domains) {
  const domainMatches = await Promise.all(
    domains.map((domain) => domain.match(string))
  );

  const domainConversionsPromises = domainMatches.map(async (matches, i) => {
    const conversionPromises = matches.map(async (match) => ({
      domainID: i, // Differentiate domains while keeping a flat output
      inputValue: match.value,
      range: match.range,
      renderSettings: await domains[i].getRenderSettings(),
      values: match.value.convert
        ? await match.value.convert()
        : await domains[i].convert(match.value),
    }));
    return await Promise.all(conversionPromises);
  });

  const domainConversions = await Promise.all(domainConversionsPromises);
  return domainConversions.flat();
}

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (message) => {
    if (message.type === 'process') {
      /** @type {{strings: string[]}} */
      const { strings } = message;
      
      const domains = await getDomains();

      /** 
       * Subarrays of conversions for the respective string in the passed 
       * {@link strings `strings`}  at the same index.
       */
      const stringConversions = await Promise.all(
        strings.map((str) => getConversions(str, domains))
      );

      port.postMessage({
        type: 'processed',
        data: stringConversions,
      });
    }
  });
});
