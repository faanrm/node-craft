import inquirer from "inquirer";
import type { ProjectModel } from "../models/project-model";
import { program } from "commander";
import path from "path";

export class PrismaCLI {
    private projectPath!: string;
    //private project: ProjectModel;

    constructor() {
        this.setupCli();
    }

    private setupCli() {
        program
            .version('0.0.1')
            .description('NodeCraft is a command-line interface (CLI) tool designed to streamline the creation of Node.js projects')
            .action(async () => {
                try {
                    await this.createProject();
                } catch (error) {
                    console.error('Error creating project:', error);
                }
            });

        program.parse(process.argv);
    }

    private async createProject() {
        const projectDetails = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectName',
                message: 'Enter project name',
                default: 'node-craft-project'
            }
        ]);

        this.projectPath = path.resolve(process.cwd(), projectDetails.projectName);
        console.log(`Project path set to: ${this.projectPath}`);
    }
}
