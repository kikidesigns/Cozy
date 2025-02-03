/**
 * Cozy color scheme with light and dark mode variations
 */

// Base colors
const colors = {
  orangeBrown: '#C17F59',
  darkOrangeBrown: '#A66B47',
  skyBlue: '#89B9D0',
  sageGreen: '#9CAF88',
  warmBeige: '#F5E6D3',
  lightBeige: '#FAF3EB',
  softGray: '#E8E1D9',
  white: '#FFFFFF',
  shadow: 'rgba(166, 107, 71, 0.1)',
  error: '#D88E8E',
  warning: '#E6B980',
};

// Theme-specific colors
const tintColorLight = colors.orangeBrown;
const tintColorDark = colors.lightBeige;

export const Colors = {
  // Theme colors
  light: {
    text: colors.darkOrangeBrown,
    background: colors.warmBeige,
    tint: tintColorLight,
    icon: colors.orangeBrown,
    tabIconDefault: colors.softGray,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: colors.lightBeige,
    background: '#2C1810', // Dark warm brown
    tint: tintColorDark,
    icon: colors.warmBeige,
    tabIconDefault: colors.softGray,
    tabIconSelected: tintColorDark,
  },
  // Base colors for direct use
  ...colors,
  // Functional colors
  primary: colors.orangeBrown,
  secondary: colors.skyBlue,
  success: colors.sageGreen,
  text: colors.darkOrangeBrown,
  textLight: colors.white,
  border: colors.softGray,
  background: colors.warmBeige,
};