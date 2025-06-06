import path from "path";
import fs from "fs-extra";
import ejs from "ejs";
import type { ProjectModel } from "../models/project-model";
import type { ModelField } from "../models/model-field";

export class Template {
  private projectPath!: string;
  private isAuth!: boolean;
  constructor(projectPath: string, isAuth: boolean = false) {
    this.projectPath = projectPath;
    this.isAuth = isAuth;
  }
  private models: ProjectModel[] = [];

  async setupTemplate() {
    const templateDir = path.join(this.projectPath, "templates");
    await fs.ensureDir(templateDir);
    const templates = [
      {
        name: "swagger.ts",
        content: await fs.readFile(
          path.join(__dirname, "../templates/swagger.ts"),
          "utf-8"
        ),
      },
      {
        name: "config.ts",
        content: await fs.readFile(
          path.join(__dirname, "../templates/config.ts"),
          "utf-8"
        ),
      },
      {
        name: "model-template.ts",
        content: await fs.readFile(
          path.join(__dirname, "../templates/zod-model-template.ejs"),
          "utf-8"
        ),
      },
      {
        name: "logger.ts",
        content: await fs.readFile(
          path.join(__dirname, "../templates/logger.ts"),
          "utf-8"
        ),
      },
      {
        name: "service-template.ts",
        content: await fs.readFile(
          path.join(__dirname, "../templates/zod-service-template.ejs"),
          "utf-8"
        ),
      },
      {
        name: "controller-template.ts",
        content: await fs.readFile(
          path.join(__dirname, "../templates/zod-controller-template.ejs"),
          "utf-8"
        ),
      },
      {
        name: "routes-template.ts",
        content: await fs.readFile(
          path.join(__dirname, "../templates/routing-template.ejs"),
          "utf-8"
        ),
      },
      {
        name: "validator-middleware.ts",
        content: await fs.readFile(
          path.join(__dirname, "../templates/zod-middleware.ts"),
          "utf-8"
        ),
      },
      {
        name: "interface-template.ts",
        content: await fs.readFile(
          path.join(__dirname, "../templates/interface-template.ejs"),
          "utf-8"
        ),
      },
      {
        name: "error-middleware.ts",
        content: await fs.readFile(
          path.join(__dirname, "../templates/error.middleware.ts"),
          "utf-8"
        ),
      },
    ];
    for (const template of templates) {
      await fs.writeFile(
        path.join(templateDir, template.name),
        template.content
      );
    }
  }

  async codeTemplate() {
    await fs.ensureDir(path.join(this.projectPath, "src/middleware"));
    await fs.ensureDir(path.join(this.projectPath, "src/models"));
    await fs.ensureDir(path.join(this.projectPath, "src/services"));
    await fs.ensureDir(path.join(this.projectPath, "src/controllers"));
    await fs.ensureDir(path.join(this.projectPath, "src/routes"));
    await fs.ensureDir(path.join(this.projectPath, "src/interfaces"));
    await fs.ensureDir(path.join(this.projectPath, "src/utils"));

    await fs.writeFile(
      path.join(this.projectPath, "src/utils/swagger.ts"),
      await fs.readFile(
        path.join(this.projectPath, "templates/swagger.ts"),
        "utf-8"
      )
    );
    await fs.writeFile(
      path.join(this.projectPath, "src/middleware/validator-middleware.ts"),
      await fs.readFile(
        path.join(this.projectPath, "templates/validator-middleware.ts"),
        "utf-8"
      )
    );
    await fs.writeFile(
      path.join(this.projectPath, "src/utils/config.ts"),
      await fs.readFile(
        path.join(this.projectPath, "templates/config.ts"),
        "utf-8"
      )
    );
    await fs.writeFile(
      path.join(this.projectPath, "src/utils/logger.ts"),
      await fs.readFile(
        path.join(this.projectPath, "templates/logger.ts"),
        "utf-8"
      )
    );
    await fs.writeFile(
      path.join(this.projectPath, "src/middleware/error.middleware.ts"),
      await fs.readFile(
        path.join(this.projectPath, "templates/error-middleware.ts"),
        "utf-8"
      )
    );
    await fs.writeFile(
      path.join(this.projectPath, "src/utils/logger.ts"),
      await fs.readFile(
        path.join(this.projectPath, "templates/logger.ts"),
        "utf-8"
      )
    );

    for (const model of this.models) {
      if (model.name === "User" && this.isAuth) {
        const interfaceContent = await ejs.render(
          await fs.readFile(
            path.join(this.projectPath, "templates/interface-template.ts"),
            "utf-8"
          ),
          { model }
        );
        await fs.writeFile(
          path.join(
            this.projectPath,
            `src/interfaces/${model.name.toLowerCase()}.interface.ts`
          ),
          interfaceContent
        );

        const serviceContent = await ejs.render(
          await fs.readFile(
            path.join(this.projectPath, "templates/service-template.ts"),
            "utf-8"
          ),
          { model }
        );
        await fs.writeFile(
          path.join(
            this.projectPath,
            `src/services/${model.name.toLowerCase()}.service.ts`
          ),
          serviceContent
        );

        const controllerContent = await ejs.render(
          await fs.readFile(
            path.join(this.projectPath, "templates/controller-template.ts"),
            "utf-8"
          ),
          { model }
        );
        await fs.writeFile(
          path.join(
            this.projectPath,
            `src/controllers/${model.name.toLowerCase()}.controller.ts`
          ),
          controllerContent
        );

        const routeContent = await ejs.render(
          await fs.readFile(
            path.join(this.projectPath, "templates/routes-template.ts"),
            "utf-8"
          ),
          { model }
        );
        await fs.writeFile(
          path.join(
            this.projectPath,
            `src/routes/${model.name.toLowerCase()}.routes.ts`
          ),
          routeContent
        );
        continue;
      }

      const modelContent = await ejs.render(
        await fs.readFile(
          path.join(this.projectPath, "templates/model-template.ts"),
          "utf-8"
        ),
        {
          model,
          getZodValidator: this.getZodValidator,
        }
      );
      await fs.writeFile(
        path.join(
          this.projectPath,
          `src/models/${model.name.toLowerCase()}.model.ts`
        ),
        modelContent
      );
      const interfaceContent = await ejs.render(
        await fs.readFile(
          path.join(this.projectPath, "templates/interface-template.ts"),
          "utf-8"
        ),
        { model }
      );
      await fs.writeFile(
        path.join(
          this.projectPath,
          `src/interfaces/${model.name.toLowerCase()}.interface.ts`
        ),
        interfaceContent
      );

      const serviceContent = await ejs.render(
        await fs.readFile(
          path.join(this.projectPath, "templates/service-template.ts"),
          "utf-8"
        ),
        { model }
      );
      await fs.writeFile(
        path.join(
          this.projectPath,
          `src/services/${model.name.toLowerCase()}.service.ts`
        ),
        serviceContent
      );

      const controllerContent = await ejs.render(
        await fs.readFile(
          path.join(this.projectPath, "templates/controller-template.ts"),
          "utf-8"
        ),
        { model }
      );
      await fs.writeFile(
        path.join(
          this.projectPath,
          `src/controllers/${model.name.toLowerCase()}.controller.ts`
        ),
        controllerContent
      );

      const routeContent = await ejs.render(
        await fs.readFile(
          path.join(this.projectPath, "templates/routes-template.ts"),
          "utf-8"
        ),
        { model }
      );
      await fs.writeFile(
        path.join(
          this.projectPath,
          `src/routes/${model.name.toLowerCase()}.routes.ts`
        ),
        routeContent
      );
    }

    const mainContent = await ejs.render(
      await fs.readFile(
        path.join(__dirname, "../templates/main-template.ejs"),
        "utf-8"
      ),
      {
        models: this.models,
        projectName: path.basename(this.projectPath),
        isAuth: this.isAuth,
      }
    );
    await fs.writeFile(
      path.join(this.projectPath, "src/index.ts"),
      mainContent
    );
    await fs.remove(path.join(this.projectPath, "templates"));
  }

  async getZodValidator(field: ModelField) {
    let validator = "z";
    switch (field.type) {
      case "String":
        validator += ".string()";

        if (field.minLength !== undefined) {
          validator += `.min(${field.minLength}, { message: "Must be at least ${field.minLength} characters" })`;
        }
        if (field.maxLength !== undefined) {
          validator += `.max(${field.maxLength}, { message: "Must be at most ${field.maxLength} characters" })`;
        }
        if (field.pattern !== undefined) {
          validator += `.regex(new RegExp("${field.pattern}"), { message: "Invalid format" })`;
        }
        break;
      case "Int":
        validator += ".number().int()";

        if (field.min !== undefined) {
          validator += `.min(${field.min}, { message: "Must be at least ${field.min}" })`;
        }
        if (field.max !== undefined) {
          validator += `.max(${field.max}, { message: "Must be at most ${field.max}" })`;
        }
        break;
      case "Float":
        validator += ".number()";

        if (field.min !== undefined) {
          validator += `.min(${field.min}, { message: "Must be at least ${field.min}" })`;
        }
        if (field.max !== undefined) {
          validator += `.max(${field.max}, { message: "Must be at most ${field.max}" })`;
        }
        break;
      case "Boolean":
        validator += ".boolean()";
        break;
      case "DateTime":
        validator += ".date()";
        break;
      case "Json":
        validator += ".record(z.any())";
        break;
      default:
        if (field.enumName && field.enumValues) {
          const enumValues = Object.values(field.enumValues);
          validator += `.enum([${enumValues
            .map((v) => `"${v}"`)
            .join(
              ", "
            )}], { message: "Must be one of the following values: ${enumValues.join(
            ", "
          )}" })`;
        } else if (field.isRelation) {
          validator += ".object({})";
        } else {
          validator += ".any()";
        }
    }

    if (field.isOptional) {
      validator += ".optional()";
    }

    return validator;
  }

  setModels(models: ProjectModel[]) {
    this.models = models;
  }
}
