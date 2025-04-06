import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import type { Package } from "./package";
import type { Prisma } from "./prisma";
import { execSync } from "child_process";
import chalk from "chalk";
import type { Template } from "./template";
export class Project {
  private projectPath!: string;
  constructor(
    private packageService: Package,
    private prismaService: Prisma,
    private templateService : Template,
    projectPath : string
  ) { 
    this.projectPath = projectPath
  }
  async createProject() {
    const projectDetails = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Enter project name",
        default: "node-craft-project",
      },
      {
        type: "confirm",
        name: "createModels",
        message: "Do you want to create models ?",
        default: true,
      },
    ]);
    this.projectPath = path.resolve(process.cwd(), projectDetails.projectName);
    await this.generateProjectStructure();
    if (projectDetails.createModels){
      await this.prismaService.generatePrismaModels();  
    }
    await this.templateService.setupTemplate();
  
    await this.templateService.codeTemplate();

    await this.setupProjectDependencies();
    console.log(chalk.green(`✅ Projet ${projectDetails.projectName} créé avec succès!`));
    console.log(chalk.blue(`🧪 Validation Zod intégrée dans le projet!`));

  }
  async generateProjectStructure() {
    const directory = [
      "src/models",
      "src/controllers",
      "src/routes",
      "src/services",
      "src/utils",
      "src/middlewares",
      "src/validators",
      "prisma",
      "nodemon.json",
    ];
    for (const dir of directory) {
      await fs.ensureDir(path.join(this.projectPath, dir));
    }
    await this.packageService.generatePackageJson();
    await this.createGitignore();
    await this.createEnvFile();
    await this.packageService.createTsConfig();
  }
  async createGitignore() {
    const gitignoreContent = `
node_modules/
dist/
.env
.prisma
*.log
`;

    await fs.writeFile(
      path.join(this.projectPath, '.gitignore'),
      gitignoreContent
    );
    
  }

  async createEnvFile() {
    const envContent = `
DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase?schema=public"
`;

    await fs.writeFile(
      path.join(this.projectPath, '.env'),
      envContent
    );
  }

  async setupProjectDependencies() {
    await fs.ensureDir(this.projectPath);
    execSync(`cd ${this.projectPath} && git init`);

    console.log(chalk.yellow('To install dependencies, run:'));
    console.log(chalk.cyan(`cd ${path.basename(this.projectPath)} && npm install`));
  }
}


