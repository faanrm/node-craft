import { ProjectModel } from "./project-model";

export interface DatabaseService {
  setProjectPath(projectPath: string, dbProvider: string): void;
  setModels(models: ProjectModel[]): void;
  addModel(model: ProjectModel): Promise<void>;
  generateSchema(): Promise<void>;
  generateModels(): Promise<ProjectModel[]>;
  getDependencies(): string[];
  getDevDependencies(): string[];
  getTemplates(): { target: string; source: string }[];
  getModelTemplate(): string;
  getOrmName(): string;
}
