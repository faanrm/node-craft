import { program } from "commander";
import type { Project } from "./project";

export class CLI {
    //private project: ProjectModel;
    constructor(private projectCommand: Project) {
        this.setupCli();
    }
    private setupCli() {
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
