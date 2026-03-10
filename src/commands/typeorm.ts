import type { ProjectModel } from "../models/project-model";
import { DatabaseService } from "../models/database-service.interface";
import { promptModelName, promptFieldDetails, stringValidations, numberValidations, promptEnumValues } from "../utils/model-utils";
import fs from "fs-extra";
import path from "path";

export class TypeORM implements DatabaseService {
  private models: ProjectModel[] = [];
  private projectPath: string;
  private database: string = "";
  private enums: Map<string, Record<string, string>> = new Map();

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  setProjectPath(projectPath: string, database?: string) {
    this.projectPath = projectPath;
    if (database) this.database = database;
  }

  getDependencies(): string[] {
    const deps = ["typeorm", "reflect-metadata"];
    if (this.database === "PostgreSQL") deps.push("pg");
    if (this.database === "MySQL") deps.push("mysql2");
    return deps;
  }

  getDevDependencies(): string[] {
    return ["@types/node"];
  }

  getTemplates(): { target: string; source: string }[] {
    return [
      { target: "src/utils/db.ts", source: "common/database/typeorm-config.ts" }
    ];
  }

  getModelTemplate(): string {
    return "common/database/typeorm-entity.ejs";
  }

  getOrmName(): string {
    return "TypeORM";
  }

  async generateSchema(): Promise<void> {
    // TypeORM usually uses auto-sync or migrations
    console.log("TypeORM schema generation initialized");
  }

  async generateModels(): Promise<ProjectModel[]> {
    while (true) {
      const modelName = await promptModelName();
      if (!modelName) break;
      const model: ProjectModel = { name: modelName, fields: [] };
      while (true) {
        const field = await promptFieldDetails();
        if (!field) break;

        if (field.type === "String") {
          await stringValidations(field);
        } else if (field.type === "Int" || field.type === "Float") {
          await numberValidations(field);
        } else if (field.type === "Enum" && field.enumName && field.enumValues) {
          this.enums.set(field.enumName, field.enumValues);
          field.type = field.enumName;
        }

        model.fields.push(field);
      }
      this.models.push(model);
    }
    return this.models;
  }

  async addModel(model: ProjectModel): Promise<void> {
    const index = this.models.findIndex(m => m.name === model.name);
    if (index >= 0) this.models[index] = model;
    else this.models.push(model);
    await this.generateSchema();
  }

  setModels(models: ProjectModel[]) {
    this.models = models;
  }

  getEnums(): Map<string, Record<string, string>> {
    return this.enums;
  }

  async generateEnums(): Promise<void> {
    const enumsDir = path.join(this.projectPath, "src/enums");
    await fs.ensureDir(enumsDir);

    this.enums.forEach((values, name) => {
      let enumContent = `export enum ${name} {\n`;
      Object.entries(values).forEach(([key, value]) => {
        enumContent += `  ${key} = "${value}",\n`;
      });
      enumContent += "}\n";

      fs.writeFile(path.join(enumsDir, `${name}.ts`), enumContent);
    });
  }
}
