import type { ProjectTemplateInfo } from '@devvit/shared-types/ProjectTemplateInfo.js';

import { getHeaders } from '../clientGenerators.js';
import { DEVVIT_PORTAL_URL } from '../config.js';

export class ProjectTemplateResolver {
  #options: Promise<ProjectTemplateInfo[]> | undefined = undefined;

  get options(): Promise<ProjectTemplateInfo[]> {
    this.#options ??= this.#fetchOptions();
    return this.#options;
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

  async #fetchOptions(): Promise<ProjectTemplateInfo[]> {
    const response = await fetch(DEVVIT_PORTAL_URL + '/templates.json', {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }
    return (await response.json()) as ProjectTemplateInfo[];
  }

  async isValidProjectTemplate(templateName: string): Promise<boolean> {
    return (await this.options).some(
      (opt) =>
        opt.name.toLowerCase() === templateName.toLowerCase() ||
        opt.shortName?.toLowerCase() === templateName.toLowerCase()
    );
  }
}
