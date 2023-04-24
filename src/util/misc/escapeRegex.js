/**
 * Escape regex tokens in a string.
 * [Source](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping)
 * @param {string} string
 * @returns {string}
 */
export default function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
