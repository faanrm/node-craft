import fs from "fs-extra";
import path from "path";
import ejs from "ejs";
import type { ProjectModel } from "../models/project-model";

const TEMPLATES_DIR = path.join(__dirname, "../templates");

/**
 * Authentication dependencies and versions to be added to package.json.
 */
const AUTH_DEPENDENCIES = {
  dependencies: {
    bcrypt: "^5.1.1",
    jsonwebtoken: "^9.0.2",
    "cookie-parser": "^1.4.6",
  },
  devDependencies: {
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cookie-parser": "^1.4.6",
  },
};

/**
 * Default User model representation.
 */
const DEFAULT_USER_MODEL: ProjectModel = {
  name: "User",
  fields: [
    { name: "email", type: "String", isOptional: false, isUnique: true },
    { name: "password", type: "String", isOptional: false, isUnique: false },
    { name: "name", type: "String", isOptional: true, isUnique: false },
    { name: "role", type: "String", isOptional: false, isUnique: false },
  ],
};

export class Authentication {
  private isRest: boolean = true;
  private isGraphql: boolean = false;
  private framework: 'Express' | 'Fastify' = 'Express';

  constructor(private projectPath: string) {}

  /**
   * Configures the project path and technology stack for the authentication service.
   */
  public setProjectPath(
    projectPath: string,
    isRest: boolean = true,
    isGraphql: boolean = false,
    framework: 'Express' | 'Fastify' = 'Express'
  ): void {
    this.projectPath = projectPath;
    this.isRest = isRest;
    this.isGraphql = isGraphql;
    this.framework = framework;
  }

  /**
   * Orchestrates the setup of authentication in the target project.
   */
  public async setupAuthentication(): Promise<ProjectModel> {
    try {
      await this.ensureDirectoryStructure();
      await this.generateAuthFiles(DEFAULT_USER_MODEL);
      await this.addDependenciesToPackageJson();
      await this.configureEnvironmentVariables();

      console.log("Authentication setup completed successfully");
      return DEFAULT_USER_MODEL;
    } catch (error) {
      console.error("Error setting up authentication:", error);
      throw error;
    }
  }

  /**
   * Creates the necessary directory structure for authentication.
   */
  private async ensureDirectoryStructure(): Promise<void> {
    const directories = ["middleware", "models", "services"];
    
    if (this.isRest) {
      directories.push("controllers", "routes");
    }

    const creationPromises = directories.map((dir) =>
      fs.ensureDir(path.join(this.projectPath, "src", dir))
    );

    await Promise.all(creationPromises);
  }

  /**
   * Renders and copies authentication templates to the target project.
   */
  private async generateAuthFiles(model: ProjectModel): Promise<void> {
    const templates = [
      { target: "src/models/user.model.ts", source: "common/auth/user-model.ejs" },
      { target: "src/services/auth.service.ts", source: "common/auth/auth-service.ejs" },
    ];

    if (this.framework === 'Express') {
        templates.push(
           { target: "src/middleware/auth.middleware.ts", source: "express/auth/middleware.ejs" }
        );

        if (this.isRest) {
          templates.push(
            { target: "src/controllers/auth.controller.ts", source: "express/auth/controller.ejs" },
            { target: "src/routes/auth.routes.ts", source: "express/auth/routes.ejs" }
          );
        }
    }
    // Add Fastify auth templates here

    for (const { target, source } of templates) {
      await this.processTemplate(source, target, { model });
    }
  }

  /**
   * Helper to render an EJS template and write it to a destination path.
   */
  private async processTemplate(
    sourceName: string,
    targetPath: string,
    data: object
  ): Promise<void> {
    const templateFullPath = path.join(TEMPLATES_DIR, sourceName);
    const destinationPath = path.join(this.projectPath, targetPath);

    const templateContent = await fs.readFile(templateFullPath, "utf-8");
    const renderedContent = await ejs.render(templateContent, data, { async: true });
    
    await fs.writeFile(destinationPath, renderedContent);
  }

  /**
   * Adds authentication dependencies to the target project's package.json.
   */
  private async addDependenciesToPackageJson(): Promise<void> {
    const packageJsonPath = path.join(this.projectPath, "package.json");
    const packageJson = await fs.readJSON(packageJsonPath);

    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...AUTH_DEPENDENCIES.dependencies,
    };

    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...AUTH_DEPENDENCIES.devDependencies,
    };

    await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
  }

  /**
   * Adds JWT configuration to the target project's .env file.
   */
  private async configureEnvironmentVariables(): Promise<void> {
    const envPath = path.join(this.projectPath, ".env");
    const defaultEnvContent = [
      "JWT_SECRET=your_jwt_secret_key_here",
      "JWT_EXPIRES_IN=7d",
    ];

    if (!(await fs.pathExists(envPath))) {
      await fs.writeFile(envPath, defaultEnvContent.join("\n") + "\n");
      return;
    }

    let envContent = await fs.readFile(envPath, "utf-8");
    let needsUpdate = false;

    for (const line of defaultEnvContent) {
      const key = line.split("=")[0];
      if (!envContent.includes(`${key}=`)) {
        envContent = envContent.trimEnd() + `\n${line}\n`;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      await fs.writeFile(envPath, envContent);
    }
  }
}
