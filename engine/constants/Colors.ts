// engine/constants/Colors.ts

/**
 * Consolidated Cozy color scheme with light and dark mode variations.
 *
 * This merges the two provided color schemes into one unified export.
 */

// Base colors
const baseColors = {
  // Using overrides from block 2 where provided.
  orangeBrown: "#D2691E",    // override from block 2
  darkOrangeBrown: "#A66B47",
  skyBlue: "#87ceeb",        // override from block 2
  sageGreen: "#9CAF88",
  warmBeige: "#F5E6D3",
  lightBeige: "#F5F5DC",      // override from block 2
  softGray: "#E8E1D9",
  white: "#FFFFFF",
  shadow: "rgba(166, 107, 71, 0.1)",
  error: "#D88E8E",
  warning: "#E6B980",
  grassGreen: "#006400",     // new key from block 2
};

const tintColorLight = baseColors.orangeBrown;
const tintColorDark = baseColors.lightBeige;

export const Colors = {
  // Theme colors for light and dark modes.
  light: {
    text: baseColors.darkOrangeBrown,
    background: baseColors.warmBeige,
    tint: tintColorLight,
    icon: baseColors.orangeBrown,
    tabIconDefault: baseColors.softGray,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: baseColors.lightBeige,
    background: "#2C1810", // Dark warm brown
    tint: tintColorDark,
    icon: baseColors.warmBeige,
    tabIconDefault: baseColors.softGray,
    tabIconSelected: tintColorDark,
  },
  // Base colors for direct use.
  ...baseColors,
  // Functional colors.
  primary: baseColors.orangeBrown,
  secondary: baseColors.skyBlue,
  success: baseColors.sageGreen,
  text: baseColors.darkOrangeBrown,
  textLight: baseColors.white,
  border: baseColors.softGray,
  background: baseColors.warmBeige,
};
