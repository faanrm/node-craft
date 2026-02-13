import path from "path";
import fs from "fs-extra";
import ejs from "ejs";
import type { ProjectModel } from "../models/project-model";
import type { ModelField } from "../models/model-field";

const TEMPLATES_DIR = path.join(__dirname, "../templates");

export class Template {
  private projectPath!: string;
  private framework: 'Express' | 'Fastify' = 'Express';
  private isAuth!: boolean;
  private isGraphql!: boolean;
  private isRest!: boolean;
  private models: ProjectModel[] = [];

  constructor(
    projectPath: string,
    framework: 'Express' | 'Fastify' = 'Express',
    isAuth: boolean = false,
    isGraphql: boolean = false,
    isRest: boolean = true
  ) {
    this.projectPath = projectPath;
    this.framework = framework;
    this.isAuth = isAuth;
    this.isGraphql = isGraphql;
    this.isRest = isRest;
  }

  public setProjectPath(
    projectPath: string,
    framework?: 'Express' | 'Fastify',
    isAuth?: boolean,
    isGraphql?: boolean,
    isRest?: boolean
  ): void {
    this.projectPath = projectPath;
    if (framework !== undefined) this.framework = framework;
    if (isAuth !== undefined) this.isAuth = isAuth;
    if (isGraphql !== undefined) this.isGraphql = isGraphql;
    if (isRest !== undefined) this.isRest = isRest;
  }

  public setModels(models: ProjectModel[]): void {
    this.models = models;
  }

  /**
   * Orchestrates the template generation process for the project.
   */
  public async codeTemplate(): Promise<void> {
    await this.ensureDirectories();
    await this.generateUtilityFiles();
    await this.generateModelFiles();
    await this.generateMainFile();

    if (this.isGraphql) {
      await this.generateGraphqlFiles();
    }
  }

  /**
   * Ensures all base and technology-specific directories exist.
   */
  private async ensureDirectories(): Promise<void> {
    const coreDirs = [
      "src/middleware",
      "src/models",
      "src/services",
      "src/interfaces",
      "src/utils",
    ];

    const directories = [...coreDirs];

    if (this.isRest) {
      directories.push("src/controllers", "src/routes");
    }

    if (this.isGraphql) {
      directories.push("src/graphql");
    }

    const creationPromises = directories.map((dir) =>
      fs.ensureDir(path.join(this.projectPath, dir))
    );

    await Promise.all(creationPromises);
  }

  /**
   * Generates common utility and middleware files.
   */
  private async generateUtilityFiles(): Promise<void> {
    const utilsTemplates = [
      { target: "src/utils/config.ts", source: "common/config.ts" },
      { target: "src/utils/logger.ts", source: "common/logger.ts" },
      { target: "src/utils/prisma.ts", source: "common/prisma-client.ts" },
    ];

    if (this.framework === 'Express') {
       utilsTemplates.push(
         { target: "src/utils/catch-async.ts", source: "express/utils/catch-async.ts" },
         { target: "src/middleware/validator-middleware.ts", source: "express/middleware/validator.middleware.ts" },
         { target: "src/middleware/error.middleware.ts", source: "express/middleware/error.middleware.ts" }
       );
    }
    // Add Fastify equivalents here when available

    for (const { target, source } of utilsTemplates) {
      // Utilities currently don't use model data but we pass standard flags for consistency
      await this.processTemplate(source, target, {});
    }
  }

  /**
   * Generates files for each defined model.
   */
  private async generateModelFiles(): Promise<void> {
    for (const model of this.models) {
      const name = model.name.toLowerCase();
      const modelTemplates = [
        { target: `src/interfaces/${name}.interface.ts`, source: "common/interface.ejs" },
        { target: `src/services/${name}.service.ts`, source: "common/service.ejs" },
      ];

      if (this.isRest) {
        if (this.framework === 'Express') {
          modelTemplates.push(
            { target: `src/controllers/${name}.controller.ts`, source: "express/controller.ejs" },
            { target: `src/routes/${name}.routes.ts`, source: "express/routes.ejs" }
          );
        } else if (this.framework === 'Fastify') {
          modelTemplates.push(
            { target: `src/controllers/${name}.controller.ts`, source: "fastify/controller.ejs" },
            { target: `src/routes/${name}.routes.ts`, source: "fastify/routes.ejs" }
          );
        }
      }

      // Skip User model if authentication is enabled, as it's handled by Authentication service
      if (!(model.name === "User" && this.isAuth)) {
        modelTemplates.push({
          target: `src/models/${name}.model.ts`,
          source: "common/model.ejs",
        });
      }

      for (const { target, source } of modelTemplates) {
        await this.processTemplate(source, target, {
          model,
          getZodValidator: this.getZodValidator.bind(this),
        });
      }
    }
  }

  /**
   * Generates the main entry point file (src/index.ts).
   */
  private async generateMainFile(): Promise<void> {
    const templateName = this.framework === 'Fastify' ? 'fastify/main.ejs' : 'express/main.ejs';
    await this.processTemplate(templateName, "src/index.ts", {
      models: this.models,
      projectName: path.basename(this.projectPath),
    });
  }

  /**
   * Generates GraphQL-specific schema and resolver files.
   */
  private async generateGraphqlFiles(): Promise<void> {
    const graphqlDir = path.join(this.projectPath, "src/graphql");
    await fs.ensureDir(graphqlDir);

    await this.processTemplate("common/graphql-schema.ejs", "src/graphql/schema.ts", {
      models: this.models,
    });

    await this.processTemplate("common/graphql-resolvers.ejs", "src/graphql/resolvers.ts", {
      models: this.models,
    });
  }

  /**
   * Helper to render an EJS template and write it to a destination path.
   * Automatically injects common flags (isAuth, isRest, isGraphql).
   */
  private async processTemplate(
    sourceName: string,
    targetPath: string,
    data: object
  ): Promise<void> {
    const templateFullPath = path.join(TEMPLATES_DIR, sourceName);
    const destinationPath = path.join(this.projectPath, targetPath);

    const templateContent = await fs.readFile(templateFullPath, "utf-8");
    const renderedContent = await ejs.render(templateContent, {
      ...data,
      framework: this.framework,
      isAuth: this.isAuth,
      isRest: this.isRest,
      isGraphql: this.isGraphql,
    });

    await fs.writeFile(destinationPath, renderedContent);
  }

  /**
   * Maps Prisma types to Zod validators for schema generation.
   */
  private async getZodValidator(field: ModelField): Promise<string> {
    let validator = "z";
    switch (field.type) {
      case "String":
        validator += ".string()";
        if (field.minLength !== undefined) {
          validator += `.min(${field.minLength}, { message: "Must be at least ${field.minLength} characters" })`;
        }
        if (field.maxLength !== undefined) {
          validator += `.max(${field.maxLength}, { message: "Must be at most ${field.maxLength} characters" })`;
        }
        if (field.pattern !== undefined) {
          validator += `.regex(new RegExp("${field.pattern}"), { message: "Invalid format" })`;
        }
        break;
      case "Int":
        validator += ".number().int()";
        if (field.min !== undefined) {
          validator += `.min(${field.min}, { message: "Must be at least ${field.min}" })`;
        }
        if (field.max !== undefined) {
          validator += `.max(${field.max}, { message: "Must be at most ${field.max}" })`;
        }
        break;
      case "Float":
        validator += ".number()";
        if (field.min !== undefined) {
          validator += `.min(${field.min}, { message: "Must be at least ${field.min}" })`;
        }
        if (field.max !== undefined) {
          validator += `.max(${field.max}, { message: "Must be at most ${field.max}" })`;
        }
        break;
      case "Boolean":
        validator += ".boolean()";
        break;
      case "DateTime":
        validator += ".date()";
        break;
      case "Json":
        validator += ".record(z.any())";
        break;
      default:
        if (field.enumName && field.enumValues) {
          const enumValues = Object.values(field.enumValues);
          validator += `.enum([${enumValues
            .map((v) => `"${v}"`)
            .join(", ")}], { message: "Must be one of: ${enumValues.join(", ")}" })`;
        } else if (field.isRelation) {
          validator += ".object({})";
        } else {
          validator += ".any()";
        }
    }

    if (field.isOptional) {
      validator += ".optional()";
    }

    return validator;
  }
}
