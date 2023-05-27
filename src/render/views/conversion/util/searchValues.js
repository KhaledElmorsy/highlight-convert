export default function searchValues(values, query) {
  if (!query) return values;

  const process = (str) => str.toLowerCase();
  const processedQuery = process(query);
  const processedValues = values.map(({ unit: { name, id } }, index) => ({
    id: process(id),
    name: name !== undefined ? process(name) : '',
    index,
  }));

  const compareStart = (a, b) =>
    a.startsWith(processedQuery) ? -1 : b.startsWith(processedQuery) ? 1 : 0;

  const searchResultIndices = processedValues
    .filter(
      ({ name, id }) =>
        name.includes(processedQuery) || id.includes(processedQuery)
    )
    .sort((a, b) => {
      const closerName = compareStart(a.name, b.name);
      const closerID = compareStart(a.id, b.id);
      return closerName || closerID;
    });

  return searchResultIndices.map(({ index }) => values[index]);
}
