import fs from "fs-extra";
import path from "path";
import type { ProjectModel } from "../models/project-model";

export class Authentification {
  constructor(private projectPath: string) {}

  async setupAuthentication() {
    console.log("Setting up authentication...");

    const userModel: ProjectModel & { handledByAuth?: boolean } = {
      name: "User",
      fields: [
        {
          name: "email",
          type: "String",
          isOptional: false,
          isUnique: true,
        },
        {
          name: "password",
          type: "String",
          isOptional: false,
          isUnique: false,
        },
        {
          name: "name",
          type: "String",
          isOptional: true,
          isUnique: false,
        },
        {
          name: "role",
          type: "String",
          isOptional: false,
          isUnique: false,
        },
      ],
      handledByAuth: true,
    };

    try {
      await fs.ensureDir(path.join(this.projectPath, "src/middleware"));
      await fs.ensureDir(path.join(this.projectPath, "src/models"));
      await fs.ensureDir(path.join(this.projectPath, "src/services"));
      await fs.ensureDir(path.join(this.projectPath, "src/controllers"));
      await fs.ensureDir(path.join(this.projectPath, "src/routes"));

      await this.copyAuthTemplates();

      await this.updatePackageJson();

      await this.updateEnvWithJwtSecret();

      await this.updateMainFile();

      console.log("Authentication setup completed successfully");
      return userModel;
    } catch (error) {
      console.error("Error setting up authentication:", error);
      throw error;
    }
  }

  private async copyAuthTemplates() {
    await fs.writeFile(
      path.join(this.projectPath, "src/middleware/auth.middleware.ts"),
      await fs.readFile(
        path.join(__dirname, "../templates/auth/auth-middleware.ejs"),
        "utf-8",
      ),
    );

    await fs.writeFile(
      path.join(this.projectPath, "src/models/user.model.ts"),
      await fs.readFile(
        path.join(__dirname, "../templates/auth/user-model.ejs"),
        "utf-8",
      ),
    );

    await fs.writeFile(
      path.join(this.projectPath, "src/services/auth.service.ts"),
      await fs.readFile(
        path.join(__dirname, "../templates/auth/auth-service.ejs"),
        "utf-8",
      ),
    );

    await fs.writeFile(
      path.join(this.projectPath, "src/controllers/auth.controller.ts"),
      await fs.readFile(
        path.join(__dirname, "../templates/auth/auth-controller.ejs"),
        "utf-8",
      ),
    );

    await fs.writeFile(
      path.join(this.projectPath, "src/routes/auth.routes.ts"),
      await fs.readFile(
        path.join(__dirname, "../templates/auth/auth-routes.ejs"),
        "utf-8",
      ),
    );
  }

  private async updatePackageJson() {
    const packageJsonPath = path.join(this.projectPath, "package.json");
    const packageJson = await fs.readJSON(packageJsonPath);

    packageJson.dependencies = {
      ...packageJson.dependencies,
      bcrypt: "^5.1.1",
      jsonwebtoken: "^9.0.2",
      "cookie-parser": "^1.4.6",
    };

    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      "@types/bcrypt": "^5.0.2",
      "@types/jsonwebtoken": "^9.0.5",
      "@types/cookie-parser": "^1.4.6",
    };

    await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
  }

  private async updateEnvWithJwtSecret() {
    const envPath = path.join(this.projectPath, ".env");
    const envContent = await fs.readFile(envPath, "utf-8");

    const updatedEnvContent =
      envContent + "\nJWT_SECRET=your_jwt_secret_key_here\nJWT_EXPIRES_IN=7d\n";

    await fs.writeFile(envPath, updatedEnvContent);
  }

  private async updateMainFile() {
    const indexPath = path.join(this.projectPath, "src/index.ts");

    if (await fs.pathExists(indexPath)) {
      let mainContent = await fs.readFile(indexPath, "utf-8");

      if (!mainContent.includes("import authRouter")) {
        mainContent = mainContent.replace(
          "import express from 'express';",
          "import express from 'express';\nimport authRouter from './routes/auth.routes';",
        );

        if (!mainContent.includes("app.use('/api/auth'")) {
          mainContent = mainContent.replace(
            "app.use(morgan('dev'));",
            "app.use(morgan('dev'));\n\n// Auth routes\napp.use('/api/auth', authRouter);",
          );
        }

        await fs.writeFile(indexPath, mainContent);
      }
    }
  }
}

