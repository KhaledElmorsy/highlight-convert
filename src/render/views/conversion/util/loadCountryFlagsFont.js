/** 
 * Load and define country flag css font-family on the current page. 
 * 
 * It's called `TwemojiCountryFlags` and styles still need to apply it.
 * 
 * [Source](https://github.com/talkjs/country-flag-emoji-polyfill)
 */
export default function loadCountryFlagsFont() {
  const flagFontURL = chrome.runtime.getURL(
    'assets/fonts/TwemojiCountryFlags.woff2'
  );

  const style = document.createElement('style');

  style.innerHTML = `@font-face {
    font-family: "TwemojiCountryFlags";
    unicode-range: U+1F1E6-1F1FF, U+1F3F4, U+E0062-E0063, U+E0065, U+E0067,
      U+E006C, U+E006E, U+E0073-E0074, U+E0077, U+E007F;
    src: url(${flagFontURL}) format('woff2');
    font-display: swap;}`;

  document.head.append(style);
}
