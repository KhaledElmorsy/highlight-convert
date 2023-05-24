/**
 * Create units in an object mapping them to their keys from subarrays of values.
 * 
 * Adds each unit's `id` and `name` to its label array.
 * @param {[id: string, name: string, labels: string[], group: string, image:string, alt:string][]} inputArray
 * @returns {{[id: Unit['id']]: Unit}}
 */
export default function createUnitMap(inputArray) {
  return inputArray.reduce((acc, [id, name, labels = [], group, image, alt]) => {
    return {
      ...acc,
      [id]: {
        id,
        ...(name ? { name } : {}),
        labels: [id, ...(name ? [name] : []), ...labels],
        ...(group ? { group } : {}),
        ...(image || alt
          ? {
              symbol: {
                ...(image ? { image } : {}),
                ...(alt ? { alt } : {}),
              },
            }
          : {}),
      },
    };
  }, {});
}
