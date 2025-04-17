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
        name: "domain/entity-template.ejs",
        content: await fs.readFile(
          path.join(__dirname, "../templates/domain/entity-template.ejs"),
          "utf-8"
        ),
      },
      {
        name: "domain/repository-interface-template.ejs",
        content: await fs.readFile(
          path.join(
            __dirname,
            "../templates/domain/repository-interface-template.ejs"
          ),
          "utf-8"
        ),
      },
      {
        name: "application/dto-template.ejs",
        content: await fs.readFile(
          path.join(__dirname, "../templates/application/dto-template.ejs"),
          "utf-8"
        ),
      },
      {
        name: "application/use-case-template.ejs",
        content: await fs.readFile(
          path.join(
            __dirname,
            "../templates/application/use-case-template.ejs"
          ),
          "utf-8"
        ),
      },
      {
        name: "infrastructure/repository-implementation-template.ejs",
        content: await fs.readFile(
          path.join(
            __dirname,
            "../templates/infrastructure/repository-implementation-template.ejs"
          ),
          "utf-8"
        ),
      },
      {
        name: "interface/controller-template.ejs",
        content: await fs.readFile(
          path.join(
            __dirname,
            "../templates/interface/controller-template.ejs"
          ),
          "utf-8"
        ),
      },
      {
        name: "interface/route-template.ejs",
        content: await fs.readFile(
          path.join(__dirname, "../templates/interface/route-template.ejs"),
          "utf-8"
        ),
      },
      {
        name: "interface/validation-middleware.ejs",
        content: await fs.readFile(
          path.join(
            __dirname,
            "../templates/interface/validation-middleware.ejs"
          ),
          "utf-8"
        ),
      },
      {
        name: "infrastructure/container-template.ejs",
        content: await fs.readFile(
          path.join(
            __dirname,
            "../templates/infrastructure/container-template.ejs"
          ),
          "utf-8"
        ),
      },
    ];

    for (const template of templates) {
      const dirPath = path.dirname(path.join(templateDir, template.name));
      await fs.ensureDir(dirPath);
      await fs.writeFile(
        path.join(templateDir, template.name),
        template.content
      );
    }
  }

  async codeTemplate() {
    await fs.ensureDir(path.join(this.projectPath, "src/domain/entities"));
    await fs.ensureDir(path.join(this.projectPath, "src/domain/repositories"));
    await fs.ensureDir(path.join(this.projectPath, "src/domain/services"));
    let containerRegistrations = [];

    await fs.ensureDir(
      path.join(this.projectPath, "src/application/use-cases")
    );
    await fs.ensureDir(path.join(this.projectPath, "src/application/dtos"));
    await fs.ensureDir(
      path.join(this.projectPath, "src/application/interfaces")
    );

    await fs.ensureDir(
      path.join(this.projectPath, "src/infrastructure/database")
    );
    await fs.ensureDir(
      path.join(this.projectPath, "src/infrastructure/repositories")
    );
    await fs.ensureDir(
      path.join(this.projectPath, "src/infrastructure/services")
    );

    await fs.ensureDir(
      path.join(this.projectPath, "src/interface/http/controllers")
    );
    await fs.ensureDir(
      path.join(this.projectPath, "src/interface/http/middlewares")
    );
    await fs.ensureDir(
      path.join(this.projectPath, "src/interface/http/routes")
    );
    await fs.ensureDir(path.join(this.projectPath, "src/interface/validators"));

    await fs.ensureDir(path.join(this.projectPath, "src/shared/utils"));
    await fs.ensureDir(path.join(this.projectPath, "src/shared/config"));

    await fs.writeFile(
      path.join(
        this.projectPath,
        "src/interface/http/middlewares/validation.middleware.ts"
      ),
      await fs.readFile(
        path.join(
          this.projectPath,
          "templates/interface/validation-middleware.ejs"
        ),
        "utf-8"
      )
    );

    //   let containerContent = "";

    for (const model of this.models) {
      if (model.name === "User" && this.isAuth) {
        continue;
      }

      const entityContent = await ejs.render(
        await fs.readFile(
          path.join(this.projectPath, "templates/domain/entity-template.ejs"),
          "utf-8"
        ),
        { model }
      );
      await fs.writeFile(
        path.join(
          this.projectPath,
          `src/domain/entities/${model.name.toLowerCase()}.ts`
        ),
        entityContent
      );

      const repositoryInterfaceContent = await ejs.render(
        await fs.readFile(
          path.join(
            this.projectPath,
            "templates/domain/repository-interface-template.ejs"
          ),
          "utf-8"
        ),
        { model }
      );
      await fs.writeFile(
        path.join(
          this.projectPath,
          `src/domain/repositories/${model.name.toLowerCase()}.repository.ts`
        ),
        repositoryInterfaceContent
      );

      const dtoContent = await ejs.render(
        await fs.readFile(
          path.join(this.projectPath, "templates/application/dto-template.ejs"),
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
          `src/application/dtos/${model.name.toLowerCase()}.dto.ts`
        ),
        dtoContent
      );

      const useCaseContent = await ejs.render(
        await fs.readFile(
          path.join(
            this.projectPath,
            "templates/application/use-case-template.ejs"
          ),
          "utf-8"
        ),
        { model }
      );
      await fs.writeFile(
        path.join(
          this.projectPath,
          `src/application/use-cases/${model.name.toLowerCase()}.use-case.ts`
        ),
        useCaseContent
      );

      const repositoryImplContent = await ejs.render(
        await fs.readFile(
          path.join(
            this.projectPath,
            "templates/infrastructure/repository-implementation-template.ejs"
          ),
          "utf-8"
        ),
        { model }
      );
      await fs.writeFile(
        path.join(
          this.projectPath,
          `src/infrastructure/repositories/${model.name.toLowerCase()}.repository.ts`
        ),
        repositoryImplContent
      );

      const controllerContent = await ejs.render(
        await fs.readFile(
          path.join(
            this.projectPath,
            "templates/interface/controller-template.ejs"
          ),
          "utf-8"
        ),
        { model }
      );
      await fs.writeFile(
        path.join(
          this.projectPath,
          `src/interface/http/controllers/${model.name.toLowerCase()}.controller.ts`
        ),
        controllerContent
      );

      const routeContent = await ejs.render(
        await fs.readFile(
          path.join(this.projectPath, "templates/interface/route-template.ejs"),
          "utf-8"
        ),
        { model }
      );
      await fs.writeFile(
        path.join(
          this.projectPath,
          `src/interface/http/routes/${model.name.toLowerCase()}.routes.ts`
        ),
        routeContent
      );

      const containerReg = await ejs.render(
        await fs.readFile(
          path.join(
            this.projectPath,
            "templates/infrastructure/container-template.ejs"
          ),
          "utf-8"
        ),
        { model }
      );
      containerRegistrations.push(containerReg);
    }
    const containerContent = containerRegistrations.join("\n");
    let authContainerContent = "";
    if (this.isAuth) {
      authContainerContent = `
  import { PrismaUserRepository } from './repositories/user.repository';
  import { AuthUseCase } from '../application/auth-use-case';
  import { AuthController } from '../interface/http/controllers/auth.controller';
  
  container.registerSingleton('IUserRepository', PrismaUserRepository);
  container.registerSingleton(AuthUseCase);
  container.registerSingleton(AuthController);
  `;
    }

    await fs.writeFile(
      path.join(this.projectPath, "src/infrastructure/container.ts"),
      `import 'reflect-metadata';\nimport { container } from 'tsyringe';\nimport { PrismaClient } from '@prisma/client';\n\n${containerContent}\n\n${authContainerContent}\n// Register PrismaClient\ncontainer.registerSingleton('PrismaClient', PrismaClient);\n\nexport { container };`
    );
    await fs.writeFile(
      path.join(this.projectPath, "src/infrastructure/container.ts"),
      `import 'reflect-metadata';\nimport { container } from 'tsyringe';\nimport { PrismaClient } from '@prisma/client';\n\n${containerContent}\n\n// Register PrismaClient\ncontainer.registerSingleton('PrismaClient', PrismaClient);\n\nexport { container };`
    );

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
