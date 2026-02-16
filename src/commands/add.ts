import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { Template } from "./template";
import { Package } from "./package";
import { Authentication } from "./authentication";
import { Mongoose } from "./mongoose";
import { TypeORM } from "./typeorm";
import { SequelizeService } from "./sequelize";
import { DatabaseService } from "../models/database-service.interface";
import { Prisma } from "./prisma";

import { promptModelName, promptFieldDetails, stringValidations, numberValidations } from "../utils/model-utils";

export class Add {
  private projectPath: string;

  constructor(
    private authenticationService: Authentication,
    private packageService: Package,
    private databaseService: DatabaseService,
    private templateService: Template
  ) {
    this.projectPath = process.cwd();
  }


  /**
   * Main entry point for adding a new module/model to an existing project.
   */
  public async addModule(): Promise<void> {
    const configPath = path.join(this.projectPath, "node-craft.json");

    if (!(await fs.pathExists(configPath))) {
      console.log(chalk.red(" Error: node-craft.json not found. Are you in a NodeCraft project directory?"));
      return;
    }

    const config = await fs.readJSON(configPath);
    console.log(chalk.blue(`🛠 Detected project: ${config.projectName} (${config.framework})`));

    // Prompt for new model
    const modelName = await promptModelName();
    if (!modelName) return;

    if (config.models.some((m: any) => m.name.toLowerCase() === modelName.toLowerCase())) {
      console.log(chalk.yellow(`Model ${modelName} already exists.`));
      return;
    }

    const newModel: any = { name: modelName, fields: [] };
    while (true) {
      const field = await promptFieldDetails();
      if (!field) break;

      if (field.type === "String") {
        await stringValidations(field);
      } else if (field.type === "Int" || field.type === "Float") {
        await numberValidations(field);
      }
      newModel.fields.push(field);
    }

    // Update config (The Brain)
    config.models.push(newModel);
    await fs.writeJSON(configPath, config, { spaces: 2 });

    // Configure services from config
    if (config.orm === "Mongoose") {
      this.databaseService = new Mongoose(this.projectPath);
    } else if (config.orm === "TypeORM") {
      this.databaseService = new TypeORM(this.projectPath);
    } else if (config.orm === "Sequelize") {
      this.databaseService = new SequelizeService(this.projectPath);
    } else {
      this.databaseService = new Prisma(this.projectPath);
    }


    this.databaseService.setProjectPath(this.projectPath, config.database);
    this.databaseService.setModels(config.models);

    this.templateService.setProjectPath(
      this.projectPath,
      this.databaseService,
      config.framework,
      config.features.authentication,
      config.features.graphql,
      config.features.rest
    );
    this.templateService.setModels(config.models);

    // Regenerate Schema
    await this.databaseService.generateSchema();


    //  Generate Code for the new model (Incremental)
    await this.templateService.codeTemplate([newModel]);

    console.log(chalk.green(`\n Module ${modelName} added successfully!`));
    console.log(chalk.yellow("Don't forget to run:"));
    console.log(chalk.cyan("  npm run generate && npm run migrate"));
  }
}
