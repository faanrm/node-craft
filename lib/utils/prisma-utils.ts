import type { ModelField } from "../models/model-field";
import inquirer from "inquirer";

/*export const stringValidations = async (field: ModelField) => {
    const response = await inquirer.prompt([
        { type: 'confirm', name: 'hasMinLength', message: 'Has min length?', default: false },
        { type: 'number', name: 'minLength', message: 'Minimum length:', when: (answers) => answers.hasMinLength },
        { type: 'confirm', name: 'hasMaxLength', message: 'Set a maximum length?', default: false },
        { type: 'number', name: 'maxLength', message: 'Maximum length:', when: (answers) => answers.hasMaxLength },
        { type: 'confirm', name: 'hasPattern', message: 'Set a regex pattern?', default: false },
        { type: 'input', name: 'pattern', message: 'Regex pattern (e.g., ^[a-zA-Z0-9]+$):', when: (answers) => answers.hasPattern }
    ]);

    if (response.hasMinLength) {
        field.minLength = response.minLength;
    }
    if (response.hasMaxLength) {
        field.maxLength = response.maxLength;
    }
    if (response.hasPattern) {
        field.pattern = response.pattern;
    }
};
export const numberValidations = async (field: ModelField) => {
    const response = await inquirer.prompt([
        { type: 'confirm', name: 'hasMin', message: 'Set a minimum value?', default: false },
        { type: 'number', name: 'min', message: 'Minimum value:', when: (answers) => answers.hasMin },
        { type: 'confirm', name: 'hasMax', message: 'Set a maximum value?', default: false },
        { type: 'number', name: 'max', message: 'Maximum value:', when: (answers) => answers.hasMax }
    ]);
    if (response.hasMin) field.min = response.min;
    if (response.hasMax) field.max = response.max;
}
export const promptFieldDetails = async (): Promise<ModelField | null> => {
    try {
        const nameResponse = await inquirer.prompt([
            { type: 'input', name: 'fieldName', message: 'Enter field name (leave empty to finish)' }
        ]);

        if (!nameResponse.fieldName) return null;

        const typeResponse = await inquirer.prompt([
            {
                type: 'list',
                name: 'fieldType',
                message: 'Type of field',
                choices: ['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Relation']
            }
        ]);

        let relationType: string | undefined;
        let relationModel: string | undefined;

        if (typeResponse.fieldType === 'Relation') {
            const relationResponse = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'relationType',
                    message: 'Relation type',
                    choices: ['OneToOne', 'OneToMany', 'ManyToMany']
                },
                {
                    type: 'input',
                    name: 'relationModel',
                    message: 'Related model name',
                    validate: (input: string) => input ? true : 'Related model name is required'
                }
            ]);
            relationType = relationResponse.relationType;
            relationModel = relationResponse.relationModel;
        }

        const commonResponse = await inquirer.prompt([
            { type: 'confirm', name: 'isOptional', message: 'Is field optional?', default: false },
            { type: 'confirm', name: 'isUnique', message: 'Is field unique?', default: false }
        ]);

        const field: ModelField = {
            name: nameResponse.fieldName,
            type: typeResponse.fieldType,
            isOptional: commonResponse.isOptional,
            isUnique: commonResponse.isUnique,
            isRelation: typeResponse.fieldType === 'Relation'
        };

        if (field.isRelation) {
            field.relationType = relationType as 'OneToOne' | 'OneToMany' | 'ManyToMany';
            field.relationModel = relationModel;
        }

        if (field.type === 'String') {
            await stringValidations(field);
        } else if (field.type === 'Int' || field.type === 'Float') {
            await numberValidations(field);
        }

        return field;
    } catch (error) {
        console.error("Error prompting for field details:", error);
        return null;
    }
};
export const promptModelName = async (): Promise<string | null> => {
    const response = await inquirer.prompt([
        { type: 'input', name: 'modelName', message: 'Enter model name' }
    ]);
    return response.modelName || null;
}*/


export const stringValidations = async (field: ModelField) => {
    const response = await inquirer.prompt([
        { type: 'confirm', name: 'hasMinLength', message: 'Has min length?', default: false },
        { type: 'number', name: 'minLength', message: 'Minimum length:', when: (answers) => answers.hasMinLength },
        { type: 'confirm', name: 'hasMaxLength', message: 'Set a maximum length?', default: false },
        { type: 'number', name: 'maxLength', message: 'Maximum length:', when: (answers) => answers.hasMaxLength },
        { type: 'confirm', name: 'hasPattern', message: 'Set a regex pattern?', default: false },
        { type: 'input', name: 'pattern', message: 'Regex pattern (e.g., ^[a-zA-Z0-9]+$):', when: (answers) => answers.hasPattern }
    ]);

    if (response.hasMinLength) {
        field.minLength = response.minLength;
    }
    if (response.hasMaxLength) {
        field.maxLength = response.maxLength;
    }
    if (response.hasPattern) {
        field.pattern = response.pattern;
    }
};
export const numberValidations = async (field: ModelField) => {
    const response = await inquirer.prompt([
        { type: 'confirm', name: 'hasMin', message: 'Set a minimum value?', default: false },
        { type: 'number', name: 'min', message: 'Minimum value:', when: (answers) => answers.hasMin },
        { type: 'confirm', name: 'hasMax', message: 'Set a maximum value?', default: false },
        { type: 'number', name: 'max', message: 'Maximum value:', when: (answers) => answers.hasMax }
    ]);
    if (response.hasMin) field.min = response.min;
    if (response.hasMax) field.max = response.max;
}
export const promptFieldDetails = async (): Promise<ModelField | null> => {
    try {
        const fieldResponse = await inquirer.prompt([
            { type: 'input', name: 'fieldName', message: 'Enter field name' },
            {
                type: 'list', name: 'fieldType', message: 'Type of field',
                choices: ['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Bytes', 'Relation', 'Enum'],
                when: (answers) => answers.fieldName !== ''
            },
            { type: 'confirm', name: 'isOptional', message: 'Is field optional?', when: (answers) => answers.fieldName !== '' },
            { type: 'confirm', name: 'isUnique', message: 'Is field unique?', when: (answers) => answers.fieldName !== '' },
            {
                type: 'list', name: 'relationType', message: 'Relation type',
                choices: ['OneToOne', 'OneToMany', 'ManyToMany'],
                when: (answers) => answers.fieldType === 'Relation'
            },
            { type: 'input', name: 'relationModel', message: 'Relation model', when: (answers) => answers.fieldType === 'Relation' }
        ]);

        if (!fieldResponse.fieldName) return null;

        const field: ModelField = {
            name: fieldResponse.fieldName,
            type: fieldResponse.fieldType === 'Relation' ? fieldResponse.relationModel : fieldResponse.fieldType,
            isOptional: fieldResponse.isOptional || false,
            isUnique: fieldResponse.isUnique || false,
            isRelation: fieldResponse.fieldType === 'Relation',
            relationType: fieldResponse.relationType,
            relationModel: fieldResponse.relationModel || null
        };

        return field;
    } catch (error) {
        console.error("Error prompting for field details:", error);
        return null;
    }
};
export const promptModelName = async (): Promise<string | null> => {
    const response = await inquirer.prompt([
        { type: 'input', name: 'modelName', message: 'Enter model name' }
    ]);
    return response.modelName || null;
}