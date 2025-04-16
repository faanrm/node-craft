import type { ModelField } from "../models/model-field";
import inquirer from "inquirer";

export const stringValidations = async (field: ModelField) => {
  if (field.hasValidationsApplied) {
    return;
  }

  const response = await inquirer.prompt([
    {
      type: "confirm",
      name: "hasMinLength",
      message: "Has min length?",
      default: false,
    },
    {
      type: "number",
      name: "minLength",
      message: "Minimum length:",
      when: (answers) => answers.hasMinLength,
    },
    {
      type: "confirm",
      name: "hasMaxLength",
      message: "Set a maximum length?",
      default: false,
    },
    {
      type: "number",
      name: "maxLength",
      message: "Maximum length:",
      when: (answers) => answers.hasMaxLength,
    },
    {
      type: "confirm",
      name: "hasPattern",
      message: "Set a regex pattern?",
      default: false,
    },
    {
      type: "input",
      name: "pattern",
      message: "Regex pattern (e.g., ^[a-zA-Z0-9]+$):",
      when: (answers) => answers.hasPattern,
    },
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

  field.hasValidationsApplied = true;
};

export const numberValidations = async (field: ModelField) => {
  if (field.hasValidationsApplied) {
    return;
  }

  const response = await inquirer.prompt([
    {
      type: "confirm",
      name: "hasMin",
      message: "Set a minimum value?",
      default: false,
    },
    {
      type: "number",
      name: "min",
      message: "Minimum value:",
      when: (answers) => answers.hasMin,
    },
    {
      type: "confirm",
      name: "hasMax",
      message: "Set a maximum value?",
      default: false,
    },
    {
      type: "number",
      name: "max",
      message: "Maximum value:",
      when: (answers) => answers.hasMax,
    },
  ]);
  if (response.hasMin) field.min = response.min;
  if (response.hasMax) field.max = response.max;
  
  // Mark this field as having had validations applied
  field.hasValidationsApplied = true;
};

export const promptEnumValues = async (field: ModelField) => {
  // Check if validations have already been applied to this field
  if (field.hasValidationsApplied) {
    return;
  }

  const response = await inquirer.prompt([
    {
      type: "input",
      name: "enumName",
      message: "Enter enum name (e.g., UserRole):",
    },
    {
      type: "input",
      name: "enumValues",
      message:
        "Enter enum values separated by commas (e.g., ADMIN,USER,EDITOR):",
    },
  ]);

  if (response.enumName && response.enumValues) {
    field.enumName = response.enumName;

    const enumValues = response.enumValues
      .split(",")
      .map((val: string) => val.trim());

    field.enumValues = {};
    enumValues.forEach((val: string) => {
      if (field.enumValues) field.enumValues[val] = val;
    });

    const customMappings = await inquirer.prompt([
      {
        type: "confirm",
        name: "hasCustomMappings",
        message: "Do you want to customize enum value mappings?",
        default: false,
      },
    ]);

    if (customMappings.hasCustomMappings) {
      for (const enumKey of Object.keys(field.enumValues)) {
        const mapping = await inquirer.prompt([
          {
            type: "input",
            name: "mappedValue",
            message: `Enter custom value for ${enumKey} (default: "${enumKey}"):`,
          },
        ]);

        if (mapping.mappedValue) {
          field.enumValues[enumKey] = mapping.mappedValue;
        }
      }
    }
  }
  

  field.hasValidationsApplied = true;
};

export const promptFieldDetails = async (): Promise<ModelField | null> => {
  try {
    const fieldResponse = await inquirer.prompt([
      { type: "input", name: "fieldName", message: "Enter field name" },
      {
        type: "list",
        name: "fieldType",
        message: "Type of field",
        choices: [
          "String",
          "Int",
          "Float",
          "Boolean",
          "DateTime",
          "Relation",
          "Enum",
        ],
        when: (answers) => answers.fieldName !== "",
      },
      {
        type: "confirm",
        name: "isOptional",
        message: "Is field optional?",
        when: (answers) => answers.fieldName !== "",
      },
      {
        type: "confirm",
        name: "isUnique",
        message: "Is field unique?",
        when: (answers) => answers.fieldName !== "",
      },
      {
        type: "list",
        name: "relationType",
        message: "Relation type",
        choices: ["OneToOne", "OneToMany", "ManyToMany"],
        when: (answers) => answers.fieldType === "Relation",
      },
      {
        type: "input",
        name: "relationModel",
        message: "Relation model",
        when: (answers) => answers.fieldType === "Relation",
      },
    ]);

    if (!fieldResponse.fieldName) return null;

    const field: ModelField = {
      name: fieldResponse.fieldName,
      type:
        fieldResponse.fieldType === "Relation"
          ? fieldResponse.relationModel
          : fieldResponse.fieldType,
      isOptional: fieldResponse.isOptional || false,
      isUnique: fieldResponse.isUnique || false,
      isRelation: fieldResponse.fieldType === "Relation",
      relationType: fieldResponse.relationType,
      relationModel: fieldResponse.relationModel || null,
      hasValidationsApplied: false, 
    };

    if (fieldResponse.fieldType === "String") {
      await stringValidations(field);
    } else if (
      fieldResponse.fieldType === "Int" ||
      fieldResponse.fieldType === "Float"
    ) {
      await numberValidations(field);
    } else if (fieldResponse.fieldType === "Enum") {
      await promptEnumValues(field);
    }

    return field;
  } catch (error) {
    console.error("Error prompting for field details:", error);
    return null;
  }
};

export const promptModelName = async (): Promise<string | null> => {
  const response = await inquirer.prompt([
    { type: "input", name: "modelName", message: "Enter model name" },
  ]);

  if (response.modelName) {
    return (
      response.modelName.charAt(0).toUpperCase() + response.modelName.slice(1)
    );
  }

  return null;
};