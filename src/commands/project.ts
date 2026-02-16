import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import { Package } from "./package";
import { Prisma } from "./prisma";
import { execSync } from "child_process";
import chalk from "chalk";
import { Template } from "./template";
import { Authentication } from "./authentication";
import { Mongoose } from "./mongoose";
import { TypeORM } from "./typeorm";
import { SequelizeService } from "./sequelize";

import { DatabaseService } from "../models/database-service.interface";

export class Project {
  constructor(
    private authenticationService: Authentication,
    private packageService: Package,
    private databaseService: DatabaseService,
    private templateService: Template,
    private projectPath: string,
  ) {}

  /**
   * Main entry point to create a new project.
   *
   */
  public async createProject(): Promise<void> {
    const responses = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Enter project name",
        default: "node-craft-project",
      },
      {
        type: "list",
        name: "framework",
        message: "Select a framework",
        choices: ["Express", "Fastify"],
        default: "Express",
      },
      {
        type: "list",
        name: "database",
        message: "Select a database",
        choices: ["PostgreSQL", "MySQL", "MongoDB"],
        default: "PostgreSQL",
      },
      {
        type: "list",
        name: "orm",
        message: "Select an ORM/ODM",
        choices: (answers: any) => {
          if (answers.database === "MongoDB") {
            return ["Mongoose", "Prisma", "TypeORM"];
          }
          return ["Prisma", "TypeORM", "Sequelize"];
        },
        default: (answers: any) => answers.database === "MongoDB" ? "Mongoose" : "Prisma",
        when: (answers: any) => answers.database === "MongoDB" || answers.database === "PostgreSQL" || answers.database === "MySQL",
      },
      {
        type: "confirm",
        name: "enableAuthentication",
        message: "Do you want to add authentication to your project?",
        default: false,
      },
      {
        type: "confirm",
        name: "createModels",
        message: "Do you want to create models?",
        default: true,
      },
      {
        type: "confirm",
        name: "enableGraphql",
        message: "Do you want to add GraphQL support?",
        default: false,
      },
      {
        type: "confirm",
        name: "enableRest",
        message: "Do you want to add REST support?",
        default: true,
      },
    ]);

    this.projectPath = path.resolve(process.cwd(), responses.projectName);

    // Initial project setup
    await fs.ensureDir(this.projectPath);
    
    // Switch database service based on user choice
    if (responses.orm === "Mongoose") {
      this.databaseService = new Mongoose(this.projectPath);
    } else if (responses.orm === "TypeORM") {
      this.databaseService = new TypeORM(this.projectPath);
    } else if (responses.orm === "Sequelize") {
      this.databaseService = new SequelizeService(this.projectPath);
    }

    
    this.configureServices(responses);
    await this.generateProjectStructure(responses);


    let models: any[] = [];

    // Optional model generation
    if (responses.createModels) {
      try {
        models = await this.databaseService.generateModels();
      } catch (error) {
        console.error("Error generating models:", error);
      }
    }

    // Optional authentication setup
    if (responses.enableAuthentication) {
      try {
        const authModels =
          await this.authenticationService.setupAuthentication(this.databaseService);
        models.push(...authModels);
      } catch (error) {
        console.error("Error setting up authentication:", error);
      }
    }

    // Template generation
    await this.templateService.setModels(models);
    await this.templateService.codeTemplate();

    // Ensure schema is fully generated (including auth models) before finishing
    await this.databaseService.generateSchema();

    // Generate config with models included
    await this.generateNodeCraftConfig(responses, models);

    // Finalize project setup
    await this.setupProjectDependencies();
    console.log(
      chalk.green(`Project ${responses.projectName} created successfully!`),
    );
  }

  /**
   * Configures all internal services with the selected project details.
   */
  private configureServices(responses: any): void {
    this.packageService.setProjectPath(this.projectPath, responses.framework, responses.enableGraphql);
    this.packageService.setDatabaseDependencies(
      this.databaseService.getDependencies(),
      this.databaseService.getDevDependencies()
    );
    this.databaseService.setProjectPath(this.projectPath, responses.database);
    this.templateService.setProjectPath(
      this.projectPath,
      this.databaseService,
      responses.framework,
      responses.enableAuthentication,
      responses.enableGraphql,
      responses.enableRest,
    );


    this.authenticationService.setProjectPath(
      this.projectPath,
      this.databaseService,
      responses.enableRest,
      responses.enableGraphql,
      responses.framework
    );
  }

  /**
   * Generates the basic directory structure and configuration files.
   */
  public async generateProjectStructure(responses: any): Promise<void> {
    // Directories are now managed by the Template service during codeTemplate()
    // but we still ensure the root src directory for package.json/tsconfig dependencies if any
    await fs.ensureDir(path.join(this.projectPath, "src"));

    await this.packageService.generatePackageJson();
    await this.createGitignore();
    await this.createNodemonConfig();
    await this.packageService.createTsConfig();
  }

  /**
   * Generates the node-craft.json configuration file.
   */
  private async generateNodeCraftConfig(responses: any, models: any[]): Promise<void> {
    const config = {
      projectName: responses.projectName,
      framework: responses.framework,
      database: responses.database,
      orm: responses.orm,
      features: {
        authentication: responses.enableAuthentication,
        graphql: responses.enableGraphql,
        rest: responses.enableRest,
      },
      models: models.map(m => ({
        name: m.name,
        fields: m.fields
      })),
      createdAt: new Date().toISOString(),
      version: "2.0-alpha",
    };

    await fs.writeJSON(path.join(this.projectPath, "node-craft.json"), config, {
      spaces: 2,
    });
  }

  /**
   * Creates a default .gitignore file.
   */
  private async createGitignore(): Promise<void> {
    const gitignoreContent = `
node_modules/
dist/
.env
.prisma
*.log
`;

    await fs.writeFile(
      path.join(this.projectPath, ".gitignore"),
      gitignoreContent.trim(),
    );
  }

  /**
   * Initializes git and provides installation instructions.
   */
  private async setupProjectDependencies(): Promise<void> {
    execSync(`git init`, { cwd: this.projectPath });

    console.log(chalk.yellow("\nTo install dependencies, run:"));
    console.log(
      chalk.cyan(`  cd ${path.basename(this.projectPath)} && npm install`),
    );
  }

  /**
   * Generates the nodemon.json configuration file.
   */
  private async createNodemonConfig(): Promise<void> {
    const nodemonConfig = {
      watch: ["src"],
      ext: "ts",
      ignore: ["src/**/*.spec.ts"],
      exec: "ts-node src/index.ts",
    };

    await fs.writeJSON(
      path.join(this.projectPath, "nodemon.json"),
      nodemonConfig,
      { spaces: 2 },
    );
  }
}
