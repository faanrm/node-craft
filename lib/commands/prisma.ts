import inquirer from "inquirer";
import type { ProjectModel } from "../models/project-model";
import type { ModelField } from "../models/model-field";

export class Prisma {
    constructor() { }

    private models: ProjectModel[] = [];
    async generatePrismaModels() {
        while (true) {
            const modelResponse = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'modelName',
                    message: 'Enter model name',
                }
            ]);
            if (!modelResponse.modelName) break;
            const model: ProjectModel = {
                name: modelResponse.modelName,
                fields: []
            };
            while (true) {
                const fieldResponse = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'fieldName',
                        message: 'Enter field name',
                    },
                    {
                        type: 'list',
                        name: 'fieldType',
                        message: 'Type of field',
                        choices: [
                            'String',
                            'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Bytes', 'Relation', 'Enum'],
                        when: (answers) => answers.fieldName !== ''
                    },
                    {
                        type: 'confirm',
                        name: 'isOptional',
                        message: 'Is field optional?',
                        when: (answers) => answers.fieldName !== ''
                    },
                    {
                        type: 'confirm',
                        name: 'isUnique',
                        message: 'Is field unique?',
                        when: (answers) => answers.fieldName !== ''
                    },
                    {
                        type: 'list',
                        name: 'relationType',
                        message: 'Relation type',
                        choices: ['OneToOne', 'OneToMany', 'ManyToMany'],
                        when: (answers) => answers.fieldType === 'Relation'
                    },
                    {
                        type: 'input',
                        name: 'relationModel',
                        message: 'Relation model',
                        when: (answers) => answers.fieldType === 'Relation'
                    }
                ]);
                if (!fieldResponse.fieldName) break;
                const field: ModelField = {
                    name: fieldResponse.fieldName,
                    type: fieldResponse.fieldType === 'Relation'
                        ? fieldResponse.relationModel
                        : fieldResponse.fieldType,
                    isOptional: fieldResponse.isOptional,
                    isUnique: fieldResponse.isUnique,
                    isRelation: fieldResponse.fieldType === 'Relation',
                    relationType: fieldResponse.relationType,
                    relationModel: fieldResponse.relationModel
                };
                if (field.type === 'String') {
                    const stringValidationResponse = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'hasMinLength',
                            message: 'Has min length?',
                            default: false
                        },
                        {
                            type: 'number',
                            name: 'minLength',
                            message: 'Minimum length:',
                            when: (answers) => answers.hasMinLength
                        },
                        {
                            type: 'confirm',
                            name: 'hasMaxLength',
                            message: 'Set a maximum length?',
                            default: false
                        },
                        {
                            type: 'number',
                            name: 'maxLength',
                            message: 'Maximum length:',
                            when: (answers) => answers.hasMaxLength
                        },
                        {
                            type: 'confirm',
                            name: 'hasPattern',
                            message: 'Set a regex pattern?',
                            default: false
                        },
                        {
                            type: 'input',
                            name: 'pattern',
                            message: 'Regex pattern (e.g., ^[a-zA-Z0-9]+$):',
                            when: (answers) => answers.hasPattern
                        }
                    ]);

                    if (stringValidationResponse.hasMinLength) {
                        field.minLength = stringValidationResponse.minLength;
                    }
                    if (stringValidationResponse.hasMaxLength) {
                        field.maxLength = stringValidationResponse.maxLength;
                    }
                    if (stringValidationResponse.hasPattern) {
                        field.pattern = stringValidationResponse.pattern;
                    }
                }
                /*number validation */
                if (field.type === 'Int' || field.type === 'Float') {
                    const numberValidationResponse = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'hasMin',
                            message: 'Set a minimum value?',
                            default: false
                        },
                        {
                            type: 'number',
                            name: 'min',
                            message: 'Minimum value:',
                            when: (answers) => answers.hasMin
                        },
                        {
                            type: 'confirm',
                            name: 'hasMax',
                            message: 'Set a maximum value?',
                            default: false
                        },
                        {
                            type: 'number',
                            name: 'max',
                            message: 'Maximum value:',
                            when: (answers) => answers.hasMax
                        }
                    ]);

                    if (numberValidationResponse.hasMin) {
                        field.min = numberValidationResponse.min;
                    }
                    if (numberValidationResponse.hasMax) {
                        field.max = numberValidationResponse.max;
                    }
                }

                model.fields.push(field);
            }

            this.models.push(model);
        }

        await this.generatePrismaModels();
    }
}
