export type ProjectTemplateInfo = {
  name: string;
  shortName: string; // Field for a URL-safe shorter name or alias
  description: string;
  url: string;
  /** Optional field to hide the template from all listings */
  hidden?: boolean;
  overrides?: {
    [key in ProjectTemplateOverrides]?: Partial<Omit<ProjectTemplateInfo, 'overrides'>>;
  };
  category?: ProjectTemplateCategory;
};

export enum ProjectTemplateOverrides {
  CLI = 'cli',
  New = 'new',
}

export enum ProjectTemplateCategory {
  Web = 'web',
  Other = 'other',
}
