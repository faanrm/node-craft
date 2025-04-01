import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import type { Package } from "./package";
import type { Prisma } from "./prisma";
export class Project {
  private projectPath!: string;
  constructor(
    private packageService: Package,
    private prismaService: Prisma,
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
        type: "confirm",
        name: "createModels",
        message: "Do you want to create models ?",
        default: true,
      },
    ]);
    this.projectPath = path.resolve(process.cwd(), projectDetails.projectName);
    //console.log(`Project path set to: ${this.projectPath}`);
    await this.packageService.generatePackageJson();
    await this.prismaService.generatePrismaModels();
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
  }
}
