


/**
 * Converts an RGB color value to its corresponding hexadecimal representation.
 * @param rgb - An array of three numbers representing the red, green, and blue values of the color.
 * @returns The hexadecimal representation of the RGB color.
 */
export const rgbToHex = (rgb: number[]): string =>
  "#" + rgb
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");

/**
 * Calculates the Euclidean distance between two RGB colors.
 * @param color1 - The first RGB color represented as an array of numbers.
 * @param color2 - The second RGB color represented as an array of numbers.
 * @returns The Euclidean distance between the two RGB colors.
 */
export function rgbDistance(color1: number[], color2: number[]): number {
    return Math.sqrt(
      color1.reduce((acc, val, i) => acc + Math.pow(val - color2[i], 2), 0),
    );
  }

/**
 * Finds the most dissimilar color to the given primary color from a color palette.
 * @param primaryColor - The primary color represented as an array of RGB values.
 * @param colorPalette - The color palette represented as an array of arrays, where each inner array represents a color with RGB values.
 * @returns The most dissimilar color to the primary color from the color palette.
 */
export function findDissimilarColor(
    primaryColor: number[],
    colorPalette: number[][],
  ): number[] {
    let maxDistance = -1;
    let secondaryColor = primaryColor;
  
    for (const color of colorPalette) {
      const distance = rgbDistance(primaryColor, color);
      if (distance > maxDistance) {
        maxDistance = distance;
        secondaryColor = color;
      }
    }
  
    return secondaryColor;
  }