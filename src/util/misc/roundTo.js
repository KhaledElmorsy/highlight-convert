export default function roundTo(number, decimals) {
  return Math.round(number * 10 ** decimals) / 10 ** decimals
}
