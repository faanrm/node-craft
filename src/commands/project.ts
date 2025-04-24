import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import { Package } from "./package";
import { Prisma } from "./prisma";
import { execSync } from "child_process";
import chalk from "chalk";
import { Template } from "./template";
import { Authentification } from "./authentification";

export class Project {
  constructor(
    private authService: Authentification,
    private packageService: Package,
    private prismaService: Prisma,
    private templateService: Template,
    private projectPath: string
  ) {}
  async createProject() {
    const projectDetails = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Enter project name",
        default: "node-craft-project",
      },
      {
        type: "list",
        name: "database",
        message: "Select a database",
        choices: ["PostgreSQL", "MySQL", "MongoDB"],
        default: "PostgreSQL",
      },
      {
        type: "confirm",
        name: "authentification",
        message: "Do you want to add authentication to your project ?",
        default: false,
      },
      {
        type: "confirm",
        name: "createModels",
        message: "Do you want to create models ?",
        default: true,
      },
    ]);

    this.projectPath = path.resolve(process.cwd(), projectDetails.projectName);

    await fs.ensureDir(this.projectPath);

    this.packageService = new Package(this.projectPath);
    this.prismaService = new Prisma(this.projectPath, projectDetails.database);
    this.templateService = new Template(
      this.projectPath,
      projectDetails.authentification
    );
    this.authService = new Authentification(this.projectPath);
    await this.generateProjectStructure();

    let models: any = [];
    if (projectDetails.createModels) {
      try {
        models = await this.prismaService.generatePrismaModels();
      } catch (error) {
        console.error("Error generating Prisma models:", error);
      }
    }

    if (projectDetails.authentification) {
      try {
        const userModel = await this.authService.setupAuthentication();
        await this.prismaService.addUserModel(userModel);
        models.push(userModel);
      } catch (error) {
        console.error("Error setting up authentication:", error);
      }
    }

    await this.templateService.setupTemplate();
    await this.templateService.setModels(models);
    await this.templateService.codeTemplate();

    await this.setupProjectDependencies();
    console.log(
      chalk.green(
        `✅ Project ${projectDetails.projectName} created successfully!`
      )
    );
    //console.log(chalk.blue(`🧪 Zod validation integrated in the project!`));
  }

  async generateProjectStructure() {
    const directories = [
      "src/models",
      "src/controllers",
      "src/routes",
      "src/services",
      "src/utils",
      // "src/middlewares",
      "src/validators",
      "prisma",
    ];

    for (const dir of directories) {
      await fs.ensureDir(path.join(this.projectPath, dir));
    }

    await this.packageService.generatePackageJson();
    await this.createGitignore();
    await this.createEnvFile();
    await this.createNodemonConfig();
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
      path.join(this.projectPath, ".gitignore"),
      gitignoreContent
    );
  }

  async createEnvFile() {
    const envPath = path.join(this.projectPath, ".env");
    if (!(await fs.pathExists(envPath))) {
      const envContent = `
  DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase?schema=public"
  `;
      await fs.writeFile(path.join(this.projectPath, ".env"), envContent);
    }
  }

  async setupProjectDependencies() {
    await fs.ensureDir(this.projectPath);
    execSync(`cd ${this.projectPath} && git init`);

    console.log(chalk.yellow("To install dependencies, run:"));
    console.log(
      chalk.cyan(`cd ${path.basename(this.projectPath)} && npm install`)
    );
  }

  async createNodemonConfig() {
    const nodemonConfig = {
      watch: ["src"],
      ext: "ts",
      ignore: ["src/**/*.spec.ts"],
      exec: "ts-node src/index.ts",
    };

    await fs.writeJSON(
      path.join(this.projectPath, "nodemon.json"),
      nodemonConfig,
      { spaces: 2 }
    );
  }
}
