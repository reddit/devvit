import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type ProjectName = string;
export type ProjectPath = string;
export type ProjectConfig = {
  description: string;
  hidden?: boolean;
};
export type ProjectTemplate = {
  path: ProjectPath;
  name: ProjectName;
} & ProjectConfig;

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
  readonly #templateOptions: Map<ProjectName, ProjectTemplate> = new Map<
    ProjectName,
    ProjectTemplate
  >();
  readonly options: ProjectTemplate[];

  constructor(projectTemplatesPath: string = DEFAULT_PROJECT_TEMPLATES_PATH) {
    this.#initOptions(projectTemplatesPath);
    this.options = Array.from(this.#templateOptions.values());
  }

  resolve(query: ProjectTemplateQuery): ProjectPath {
    const projectTemplateName = query.name;
    const templateProject = this.#templateOptions.get(projectTemplateName);
    if (!templateProject) {
      throw new Error(`Specified template: ${projectTemplateName} does not exist`);
    }
    return templateProject.path;
  }

  #initOptions(templatesPath: string): void {
    fs.readdirSync(templatesPath, { withFileTypes: true })
      .filter((d) => d.isDirectory()) // only get directories
      .forEach((dirent) => {
        const projectName = dirent.name.split(path.sep).at(-1)!;
        const projectPath = path.join(templatesPath, dirent.name);
        let projectConfig: ProjectConfig;
        try {
          projectConfig = JSON.parse(
            fs.readFileSync(path.join(templatesPath, dirent.name, 'template-config.json'), 'utf-8')
          );
        } catch {
          projectConfig = {
            description: '',
            hidden: false,
          };
        }
        this.#templateOptions.set(projectName, {
          path: projectPath,
          name: projectName,
          ...projectConfig,
        });
      });
  }
}
