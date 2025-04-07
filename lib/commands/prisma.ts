import fs from "fs-extra";
import path from "path";
import type { ProjectModel } from "../models/project-model";
import {
  numberValidations,
  promptFieldDetails,
  stringValidations,
  promptModelName,
} from "../utils/prisma-utils";

export class Prisma {
  private models: ProjectModel[] = [];
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  async generatePrismaModels() {
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
        }

        model.fields.push(field);
      }

      this.models.push(model);
    }
    await this.generatePrismaSchema();
    return this.models;
  }

  async generatePrismaSchema() {
    let schemaContent =
      'generator client {\n  provider = "prisma-client-js"\n}\n\n';
    schemaContent +=
      'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\n';

    this.models.forEach((model) => {
      schemaContent += `model ${model.name} {\n`;
      schemaContent += `  id String @id @default(uuid())\n`;

      model.fields.forEach((field) => {
        let fieldLine = `  ${field.name} `;

        if (field.isRelation) {
          switch (field.relationType) {
            case "OneToOne":
              fieldLine += `${field.relationModel}?`;
              break;
            case "OneToMany":
            case "ManyToMany":
              fieldLine += `${field.relationModel}[]`;
              break;
          }
        } else {
          fieldLine += field.type;
        }

        if (field.isOptional) fieldLine += "?";
        if (field.isUnique) fieldLine += " @unique";

        schemaContent += fieldLine + "\n";
      });

      schemaContent += "}\n\n";
    });

    try {
      await fs.writeFile(
        path.join(this.projectPath, 'prisma', 'schema.prisma'),
        schemaContent
      );
      console.log('Schema generated successfully.');
    } catch (error) {
      console.error('Error generating schema:', error);
      throw error;
    }
  }
}
