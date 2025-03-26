/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

const tintColorLight = '#FF7F50';
const tintColorDark = '#8FBC8F';

export const Colors = {
  light: {
    text: '#2C3E50',
    background: '#FFF5EE',
    tint: tintColorLight,
    primary: '#FF7F50',
    primaryLight: '#FFA07A',
    secondary: '#8FBC8F',
    secondaryLight: '#98FB98',
    surface: '#FFFFFF',
    border: '#E5E5E5',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#2C3E50',
    tint: tintColorDark,
    primary: '#FF7F50',
    primaryLight: '#CD5C5C',
    secondary: '#8FBC8F',
    secondaryLight: '#3CB371',
    surface: '#1E293B',
    border: '#334155',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
