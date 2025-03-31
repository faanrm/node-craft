import inquirer from "inquirer";
import type { ProjectModel } from "../models/project-model";
import { numberValidations, promptFieldDetails, stringValidations,promptModelName } from "../utils/prisma-utils";
export class Prisma {
    private models: ProjectModel[] = [];

    constructor() { }

    async generatePrismaModels() {
        while (true) {
            const modelName = await promptModelName();
            if (!modelName) break;

            const model: ProjectModel = { name: modelName, fields: [] };
            while (true) {
                const field = await promptFieldDetails();
                if (!field) break;

                if (field.type === 'String') {
                    await stringValidations(field);
                } else if (field.type === 'Int' || field.type === 'Float') {
                    await numberValidations(field);
                }

                model.fields.push(field);
            }

            this.models.push(model);
        }
    }
}
