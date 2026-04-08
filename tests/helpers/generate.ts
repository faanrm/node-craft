import path from "path";
import fs from "fs-extra";
import { Package } from "../../src/commands/package.js";
import { Prisma } from "../../src/commands/prisma.js";
import { Project } from "../../src/commands/project.js";
import { Authentication } from "../../src/commands/authentication.js";
import { Mongoose } from "../../src/commands/mongoose.js";
import { TypeORM } from "../../src/commands/typeorm.js";
import { SequelizeService } from "../../src/commands/sequelize.js";
import { Template } from "../../src/commands/template.js";
import type { DatabaseService } from "../../src/models/database-service.interface.js";

const BASE_TMP_DIR = path.resolve(process.cwd(), "tests", ".tmp");

export interface GenerateOptions {
  projectName: string;
  framework: "Express" | "Fastify";
  database: "PostgreSQL" | "MySQL" | "MongoDB";
  orm: "Prisma" | "TypeORM" | "Sequelize" | "Mongoose";
  enableAuthentication?: boolean;
  enableGraphql?: boolean;
  enableRest?: boolean;
  models?: any[];
  scope?: string;
}


export function getTmpDir(scope: string): string {
  return path.join(BASE_TMP_DIR, scope);
}

export async function generateProject(opts: GenerateOptions): Promise<string> {
  const scopeDir = opts.scope ? path.join(BASE_TMP_DIR, opts.scope) : BASE_TMP_DIR;
  const projectPath = path.join(scopeDir, opts.projectName);

  if (await fs.pathExists(projectPath)) await fs.remove(projectPath);
  await fs.ensureDir(projectPath);

  const packageService = new Package(projectPath);
  const authService = new Authentication(projectPath);

  let dbService: DatabaseService;
  switch (opts.orm) {
    case "Mongoose":  dbService = new Mongoose(projectPath); break;
    case "TypeORM":   dbService = new TypeORM(projectPath); break;
    case "Sequelize": dbService = new SequelizeService(projectPath); break;
    default:          dbService = new Prisma(projectPath); break;
  }

  const templateService = new Template(projectPath, dbService);
  const project = new Project(authService, packageService, dbService, templateService, projectPath);

  const responses = {
    projectName: opts.projectName,
    framework: opts.framework,
    database: opts.database,
    orm: opts.orm,
    enableAuthentication: opts.enableAuthentication ?? false,
    createModels: false, // always false — we control models directly
    enableGraphql: opts.enableGraphql ?? false,
    enableRest: opts.enableRest ?? true,
  };

  (project as any).projectPath = projectPath;
  (project as any).configureServices(responses);
  await project.generateProjectStructure(responses);

  
  let models: any[] = opts.models ?? [];

  if (opts.enableAuthentication) {
    const authModels = await authService.setupAuthentication(dbService);
    for (const m of authModels) {
      const idx = models.findIndex((x) => x.name === m.name);
      if (idx >= 0) models[idx] = m; else models.push(m);
    }
  }

  await templateService.setModels(models);
  await templateService.codeTemplate();
  await dbService.generateSchema();
  await (project as any).generateNodeCraftConfig(responses, models);

  return projectPath;
}

export async function cleanScope(scope: string) {
  const dir = getTmpDir(scope);
  if (await fs.pathExists(dir)) await fs.remove(dir);
}
