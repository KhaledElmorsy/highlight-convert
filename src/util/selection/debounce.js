export default function debounce(func, duration) {
  let timeout;
  return function (...args) {
    if (timeout !== undefined) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), duration)
  }
}
