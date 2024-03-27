/**
 * Represents an RGB color.
 * @typedef {number[]} RGBColor
 */
export type RGBColor = number[];

export interface Color {
    hex: string;
    rgb: RGBColor;
}

export interface Colors {
    primary: Color;
    secondary: Color;
}