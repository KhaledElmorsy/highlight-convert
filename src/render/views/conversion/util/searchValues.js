export default function searchValues(values, query) {
  const hasName = !!values[0].unit.name;
  const process = (str) => str.toLowerCase();
  const processedQuery = process(query);
  const processedValues = values.map(({ unit: { name, id } }, index) => ({
    id: process(id),
    name: hasName ? process(name) : null,
    index,
  }));

  const compareStart = (a, b) =>
    a.startsWith(processedQuery) ? -1 : b.startsWith(processedQuery) ? 1 : 0;

  const searchResultIndices = processedValues
    .filter(
      ({ name, id }) =>
        (hasName && name.includes(processedQuery)) ||
        id.includes(processedQuery)
    )
    .sort((a, b) => {
      const closerName = !hasName ? 0 : compareStart(a.name, b.name);
      const closerID = compareStart(a.id, b.id);
      return closerName || closerID;
    });

  return searchResultIndices.map(({index}) => values[index]);
}
