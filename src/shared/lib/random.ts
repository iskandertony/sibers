/** Returns a random integer in [min, max]. */
export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
