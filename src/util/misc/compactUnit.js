export default function compactUnit({ id, name }) {
  return { id, ...(name !== undefined ? { name } : {}) };
}
