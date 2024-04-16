import type { ThemeConfig } from './types.js';

export const BINGO_TILES_COUNT = 16;

export const staticColors = {
  topRowButtonBg: '#1A282D',
  topRowButtonBgActive: '#0E8A00',
  topRowButtonText: '#FFFFFF',
  topRowButtonTextActive: '#FFFFFF',
};

export const theme: { standard: ThemeConfig } = {
  standard: {
    appBgImg: 'bg.png',
    logoImg: 'logo.png',
    logoImgWidth: 108,
    appBackgroundColor: '#ff4500',
    tileBg: '#ffffff',
    tileBgActive: '#55bd46',
    tileBorder: '#e5e5e5',
    tileBorderActive: '#4caa3f',
    tileText: '#000000',
    tileTextActive: '#ffffff',
  },
};
