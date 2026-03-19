export { Package } from "./commands/package";
export { Template } from "./commands/template";
export { Authentication } from "./commands/authentication";
export { Prisma } from "./commands/prisma";
export { Mongoose } from "./commands/mongoose";
export { TypeORM } from "./commands/typeorm";
export { SequelizeService } from "./commands/sequelize";
export type { ProjectModel } from "./models/project-model";
export type { ModelField } from "./models/model-field";
export type { DatabaseService } from "./models/database-service.interface";
import { Package } from "./commands/package";
import { Prisma } from "./commands/prisma";
import { Mongoose } from "./commands/mongoose";
import { TypeORM } from "./commands/typeorm";
import { SequelizeService } from "./commands/sequelize";
import { Template } from "./commands/template";
import { Authentication } from "./commands/authentication";
import type { DatabaseService } from "./models/database-service.interface";
import type { ProjectModel } from "./models/project-model";

export interface ProgrammaticConfig {
    projectName: string;

    framework: "Express" | "Fastify";
    database: "PostgreSQL" | "MySQL" | "MongoDB";
    orm: "Prisma" | "TypeORM" | "Sequelize" | "Mongoose";
    features: {
        authentication: boolean;
        graphql: boolean;
        restApi: boolean;
        createModels: boolean;
    };
    models: ProjectModel[];
}

/**
 * Generate an entire project on disk at `outputPath` without any interactive prompts.
 *
 * @param config  Project configuration 
 * @param outputPath  Absolute path to a directory where the project will be written.
 *                    The directory should already exist (or will be created).
 */
export async function createProjectProgrammatic(
    config: ProgrammaticConfig,
    outputPath: string
): Promise<void> {
    const { projectName, framework, database, orm, features, models } = config;
    const projectPath = outputPath;

    //  database service
    let databaseService: DatabaseService;
    switch (orm) {
        case "Mongoose":
            databaseService = new Mongoose(projectPath);
            break;
        case "TypeORM":
            databaseService = new TypeORM(projectPath);
            break;
        case "Sequelize":
            databaseService = new SequelizeService(projectPath);
            break;
        default:
            databaseService = new Prisma(projectPath);
    }

    // Configure services
    const packageService = new Package(projectPath);
    packageService.setProjectPath(projectPath, framework, features.graphql);
    packageService.setDatabaseDependencies(
        databaseService.getDependencies(),
        databaseService.getDevDependencies()
    );

    databaseService.setProjectPath(projectPath, database);

    const templateService = new Template(
        projectPath,
        databaseService,
        framework,
        features.authentication,
        features.graphql,
        features.restApi,
        database
    );

    const authService = new Authentication(projectPath);
    authService.setProjectPath(
        projectPath,
        databaseService,
        features.restApi,
        features.graphql,
        framework
    );

    // Generate base structure 
    const fs = await import("fs-extra");
    await fs.ensureDir(projectPath);
    await fs.ensureDir(`${projectPath}/src`);

    await packageService.generatePackageJson();
    await packageService.createTsConfig();

    // Pre-load models into database service
    if (models.length > 0) {
        (databaseService as any).models = models;
    }

    // Generate model schemas 
    await databaseService.generateSchema();

    // generate enums (TypeORM / Sequelize / Mongoose)
    if (typeof (databaseService as any).generateEnums === "function") {
        await (databaseService as any).generateEnums();
    }

    // Set models on template service and generate templates
    templateService.setModels(models);

    let allModels = [...models];

    //Authentication
    if (features.authentication) {
        const authModels = await authService.setupAuthentication(databaseService);
        allModels = [...allModels, ...authModels];
        templateService.setModels(allModels);
    }

    // Generate all template files 
    await templateService.codeTemplate();

    // Write node-craft.json config
    await writeNodeCraftConfig(projectPath, config, allModels);
}

async function writeNodeCraftConfig(
    projectPath: string,
    config: ProgrammaticConfig,
    models: ProjectModel[]
): Promise<void> {
    const fs = await import("fs-extra");
    const path = await import("path");

    const nodeCraftConfig = {
        version: "2.0",
        projectName: config.projectName,
        framework: config.framework,
        database: {
            type: config.database,
            orm: config.orm,
        },
        features: config.features,
        models: models.map((m) => ({
            name: m.name,
            fields: m.fields,
        })),
        generatedAt: new Date().toISOString(),
    };

    await fs.writeJSON(
        path.join(projectPath, "node-craft.json"),
        nodeCraftConfig,
        { spaces: 2 }
    );
}
