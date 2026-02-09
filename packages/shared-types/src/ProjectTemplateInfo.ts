export type ProjectTemplateInfo = {
  name: string;
  shortName: string; // Field for a URL-safe shorter name or alias
  description: string;
  url: string;
  /** Optional field to hide the template from all listings */
  hidden?: boolean;
  category?: ProjectTemplateCategory;
};

export enum ProjectTemplateCategory {
  Web = 'web',
  GameEngine = 'game-engine',
  Other = 'other',
}
