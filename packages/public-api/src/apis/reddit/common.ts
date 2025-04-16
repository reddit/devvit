export const RunAs = {
  APP: 0,
  USER: 1,
} as const;

export type UserGeneratedContent = {
  text: string;
  imageUrls?: string[];
};
