import { program } from "commander";
import type { Project } from "./project";
import type { Add } from "./add";
import path from "path";
import chalk from "chalk";
export class CLI {
    private templatePath: string;
    constructor(
        private projectCommand: Project,
        private addCommand: Add
    ) {
        this.templatePath = path.join(__dirname, 'templates');
        this.setupCli();
    }

    setupCli() {
        program
            .name('node-craft')
            .version('0.1.1')
            .description('NodeCraft: A high-performance CLI tool to scaffold  Node.js projects .')

        program
            .command('create')
            .description('Create a new project')
            .action(async () => {
                try {
                    await this.projectCommand.createProject();
                } catch (error) {
                    console.error(chalk.red('Error creating project:'), error);
                }
            });

        program
            .command('add')
            .description('Add a new module to an existing project')
            .action(async () => {
                try {
                    await this.addCommand.addModule();
                } catch (error) {
                    console.error(chalk.red('Error adding module:'), error);
                }
            });

        // Default action: show help
        program.action(() => {
            program.help();
        });

        program.parse(process.argv);
    }
}
