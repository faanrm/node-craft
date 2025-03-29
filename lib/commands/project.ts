import inquirer from "inquirer";
import path from "path"
export class Project {
    private projectPath!: string;
    constructor() { }
    async createProject() {
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