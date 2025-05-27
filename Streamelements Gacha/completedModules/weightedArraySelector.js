/**
 * @param {Array} weightedArray array of special weighted objects
 * @returns {GEObject} GEObject gacha event object, contains the data to display an event
 */
function randomGachaTier(weightedArray) {
  // additional note in case we forget: max range does not have to be counted. since this Is a summed array, the weight of the last element will be the same size as the total weight of the array
  const maxRange = weightedArray[weightedArray.length - 1].weight;
  const randomNum = Math.random() * maxRange;

  for (const { weight, value } of weightedArray) {
    if (randomNum < weight) {
      return value;
    }
  }

  return weightedArray[weightedArray.length - 1].value;
}
