import type { ProjectTemplateInfo } from '@devvit/shared-types/ProjectTemplateInfo.js';

import { DEVVIT_PORTAL_URL } from '../config.js';

export class ProjectTemplateResolver {
  readonly options: Promise<ProjectTemplateInfo[]>;

  constructor() {
    this.options = fetch(DEVVIT_PORTAL_URL + '/templates.json').then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }
      return response.json() as Promise<ProjectTemplateInfo[]>;
    });
  }

  async getProjectUrl(projectName: string): Promise<string> {
    const projectNameLower = projectName.toLowerCase();
    const options = await this.options;
    const templateProject = options.find(
      (opt) =>
        opt.name.toLowerCase() === projectNameLower ||
        opt.shortName?.toLowerCase() === projectNameLower
    );
    if (!templateProject) {
      throw new Error(`Specified template: ${projectName} does not exist`);
    }
    return templateProject.url;
  }
}
