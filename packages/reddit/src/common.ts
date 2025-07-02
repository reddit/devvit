export const RunAs = {
  APP: 0,
  USER: 1,
  UNSPECIFIED: 2,
} as const;

export type UserGeneratedContent = {
  text: string;
  imageUrls?: string[];
};
