/**
 * @param "array of weightedIndex objects"
 * @returns {GEObject}
 */
function randomGachaTier(weightedArray) {
  const maxRange = weightedArray[weightedArray.length - 1].weight;
  const randomNum = Math.random() * maxRange;

  for (const { weight, value } of weightedArray) {
    if (randomNum < weight) {
      return value;
    }
  }

  return weightedArray[weightedArray.length - 1].value;
}
