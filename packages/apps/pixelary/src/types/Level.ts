import { FlairTextColor } from '@devvit/public-api';

export type Level = {
  rank: number;
  name: string;
  min: number;
  max: number;
  backgroundColor: string;
  textColor: FlairTextColor;
  extraTime: number;
};
