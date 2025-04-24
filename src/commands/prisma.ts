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
  private enums: Map<string, Record<string, string>> = new Map();

  constructor(projectPath: string, private database: string = "") {
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
        } else if (
          field.type === "Enum" &&
          field.enumName &&
          field.enumValues
        ) {
          this.enums.set(field.enumName, field.enumValues);
          field.type = field.enumName;
        }

        model.fields.push(field);
      }

      this.models.push(model);
    }
    await this.generatePrismaSchema();
    return this.models;
  }

  async generatePrismaSchema() {
    await fs.ensureDir(path.join(this.projectPath, "prisma"));

    let schemaContent =
      'generator client {\n  provider = "prisma-client-js"\n}\n\n';

    let dbProvider, dbUrlEnvVar, idField;
    switch (this.database) {
      case "MySQL":
        dbProvider = "mysql";
        dbUrlEnvVar =
          'DATABASE_URL="mysql://username:password@localhost:3306/mydatabase"';
        idField = `  id String @id @default(uuid())\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n`;
        break;
      case "MongoDB":
        dbProvider = "mongodb";
        dbUrlEnvVar =
          'DATABASE_URL="mongodb://username:password@localhost:27017/mydatabase"';
        idField = `  id String @id @default(uuid()) @map("_id")\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n`;
        break;
      default:
        dbProvider = "postgresql";
        dbUrlEnvVar =
          'DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase?schema=public"';
        idField = `  id String @id @default(uuid())\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n`;
    }
    schemaContent += `datasource db {\n  provider = "${dbProvider}"\n  url      = env(\"DATABASE_URL\")\n}\n\n`;

    const envPath = path.join(this.projectPath, ".env");
    let envContent = "";

    if (await fs.pathExists(envPath)) {
      envContent = await fs.readFile(envPath, "utf-8");

      if (envContent.includes("DATABASE_URL=")) {
        envContent = envContent.replace(
          /DATABASE_URL=.*(\r?\n|$)/g,
          `${dbUrlEnvVar}\n`
        );
      } else {
        envContent += `\n${dbUrlEnvVar}\n`;
      }
    } else {
      envContent = `${dbUrlEnvVar}\n`;
    }

    await fs.writeFile(envPath, envContent);

    this.enums.forEach((values, name) => {
      schemaContent += `enum ${name} {\n`;
      Object.entries(values).forEach(([key, value]) => {
        schemaContent += `  ${key}\n`;
      });
      schemaContent += `}\n\n`;
    });

    this.models.forEach((model) => {
      schemaContent += `model ${model.name} {\n`;
      schemaContent += idField;

      model.fields.forEach((field) => {
        let fieldLine = `  ${field.name} `;

        if (field.isRelation) {
          if (field.relationType === "OneToOne") {
            fieldLine += `${field.relationModel}? @relation(fields: [${field.name}Id], references: [id])\n`;
            schemaContent += fieldLine;
            schemaContent += `  ${field.name}Id String? @unique\n`;
            return;
          } else if (field.relationType === "OneToMany") {
            fieldLine += `${field.relationModel}[] @relation("${model.name}To${field.relationModel}")\n`;
            schemaContent += fieldLine;
            return;
          } else if (field.relationType === "ManyToMany") {
            fieldLine += `${field.relationModel}[] @relation("${model.name}To${field.relationModel}")\n`;
            schemaContent += fieldLine;
            return;
          }
        } else {
          if (this.enums.has(field.type)) {
            fieldLine += field.type;
          } else {
            fieldLine += field.type;
          }

          if (field.isOptional) fieldLine += "?";
          if (field.isUnique) fieldLine += " @unique";
          schemaContent += fieldLine + "\n";
        }
      });

      schemaContent += "}\n\n";
    });

    try {
      await fs.writeFile(
        path.join(this.projectPath, "prisma", "schema.prisma"),
        schemaContent
      );
      console.log("Schema generated successfully.");
    } catch (error) {
      console.error("Error generating schema:", error);
      throw error;
    }

    return this.models;
  }

  async addUserModel(userModel: ProjectModel) {
    const existingUserModelIndex = this.models.findIndex(
      (m) => m.name === "User"
    );
    if (existingUserModelIndex >= 0) {
      this.models[existingUserModelIndex] = userModel;
    } else {
      this.models.push(userModel);
    }

    await this.generatePrismaSchema();
  }
}
