import { program } from "commander";
import type { Project } from "./project";
import path from "path"
export class CLI {
    private templatePath: string;
    constructor(private projectCommand: Project) {
        this.templatePath = path.join(__dirname, '../templates');
        this.setupCli();
    }
    setupCli() {
        program
            .version('0.0.1')
            .description('NodeCraft is a command-line interface (CLI) tool designed to streamline the creation of Node.js projects')
            .action(async () => {
                try {
                    await this.projectCommand.createProject();
                } catch (error) {
                    console.error('Error creating project:', error);
                }
            });
        program.parse(process.argv);
    }
}
