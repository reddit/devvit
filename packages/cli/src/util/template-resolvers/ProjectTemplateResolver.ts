import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// For now, the ProjectTemplate type is just a string that is the absolute path to a template folder
// Could see this becoming string | FileSystem in the future if we allow ActorTemplateQueries to provide urls (Github urls, for instance)
export type ProjectTemplate = string;

export type ProjectTemplateQuery = {
  name: string;
};

const DEFAULT_PROJECT_TEMPLATES_PATH = path.join(
  fileURLToPath(import.meta.url),
  '..', // This chops off the file name
  '..', // This chops off the 'util' directory
  '..', // This chops off the 'src' directory
  'templates'
);

export class ProjectTemplateResolver {
  readonly #templateOptions: Map<string, ProjectTemplate> = new Map<string, ProjectTemplate>();
  readonly options: ProjectTemplate[];

  constructor(projectTemplatesPath: string = DEFAULT_PROJECT_TEMPLATES_PATH) {
    this.#initOptions(projectTemplatesPath);
    this.options = Array.from(this.#templateOptions.keys());
  }

  resolve(query: ProjectTemplateQuery): ProjectTemplate {
    const projectTemplateName = query.name;
    const templateProject = this.#templateOptions.get(projectTemplateName);
    if (!templateProject) {
      throw new Error(`Specified template: ${projectTemplateName} does not exist`);
    }
    return templateProject;
  }

  #initOptions(templatesPath: string): void {
    fs.readdirSync(templatesPath, { withFileTypes: true })
      .filter((d) => d.isDirectory()) // only get directories
      .forEach((dirent) => {
        const projectName = dirent.name.split(path.sep).at(-1)!;
        const projectDir = path.join(templatesPath, dirent.name);
        this.#templateOptions.set(projectName, projectDir);
      });
  }
}
