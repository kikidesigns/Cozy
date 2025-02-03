/**
 * Cozy color scheme definition
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
  black: '#11181C',
  darkGray: '#687076',
};

// Functional color aliases
const shared = {
  primary: colors.orangeBrown,
  secondary: colors.skyBlue,
  success: colors.sageGreen,
  error: '#FF4D4D',
  warning: '#FFB84D',
};

export const Colors = {
  light: {
    ...shared,
    text: colors.black,
    textSecondary: colors.darkOrangeBrown,
    background: colors.warmBeige,
    backgroundAlt: colors.lightBeige,
    surface: colors.white,
    border: colors.softGray,
    tint: colors.orangeBrown,
    icon: colors.darkGray,
    tabIconDefault: colors.softGray,
    tabIconSelected: colors.orangeBrown,
  },
  dark: {
    ...shared,
    text: colors.white,
    textSecondary: colors.softGray,
    background: '#151718',
    backgroundAlt: '#1A1D1E',
    surface: '#202425',
    border: '#2E3132',
    tint: colors.orangeBrown,
    icon: colors.softGray,
    tabIconDefault: colors.softGray,
    tabIconSelected: colors.orangeBrown,
  },
};