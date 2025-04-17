import fs from "fs-extra";
import path from "path";
import type { ProjectModel } from "../models/project-model";

export class Authentification {
  constructor(private projectPath: string) {}

  async setupAuthentication() {
    console.log("Setting up authentication...");

    const userModel: ProjectModel = {
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
    };

    try {
      await fs.ensureDir(path.join(this.projectPath, "src/domain"));
      await fs.ensureDir(path.join(this.projectPath, "src/application"));
      await fs.ensureDir(path.join(this.projectPath, "src/infrastructure/repositories"));
      await fs.ensureDir(path.join(this.projectPath, "src/interface/http/controllers"));
      await fs.ensureDir(path.join(this.projectPath, "src/interface/http/middlewares"));
      await fs.ensureDir(path.join(this.projectPath, "src/interface/http/routes"));

      await this.copyAuthTemplates();
      await this.updatePackageJson();
      await this.updateEnvWithJwtSecret();

      return userModel;
    } catch (error) {
      console.error("Error setting up authentication:", error);
      throw error;
    }
  }

  private async copyAuthTemplates() {
    await fs.writeFile(
      path.join(this.projectPath, "src/interface/http/middlewares/auth.middleware.ts"),
      await fs.readFile(
        path.join(__dirname, "../templates/interface/auth-middleware.ts"),
        "utf-8"
      )
    );

    await fs.writeFile(
      path.join(this.projectPath, "src/domain/user.entity.ts"),
      await fs.readFile(
        path.join(__dirname, "../templates/domain/user.entity.ts"),
        "utf-8"
      )
    );

    await fs.writeFile(
      path.join(this.projectPath, "src/domain/user-repository.ts"),
      await fs.readFile(
        path.join(__dirname, "../templates/domain/user-repository.ts"),
        "utf-8"
      )
    );

    await fs.writeFile(
      path.join(this.projectPath, "src/application/user-dtos.ts"),
      await fs.readFile(
        path.join(__dirname, "../templates/application/user-dtos.ts"),
        "utf-8"
      )
    );

    await fs.writeFile(
      path.join(this.projectPath, "src/application/auth-use-case.ts"),
      await fs.readFile(
        path.join(__dirname, "../templates/application/auth-use-case.ts"),
        "utf-8"
      )
    );

    await fs.writeFile(
      path.join(
        this.projectPath,
        "src/infrastructure/repositories/user.repository.ts"
      ),
      await fs.readFile(
        path.join(
          __dirname,
          "../templates/infrastructure/user-repository-implementation.ts"
        ),
        "utf-8"
      )
    );

    await fs.writeFile(
      path.join(
        this.projectPath,
        "src/interface/http/controllers/auth.controller.ts"
      ),
      await fs.readFile(
        path.join(__dirname, "../templates/interface/auth-controller.ts"),
        "utf-8"
      )
    );

    await fs.writeFile(
      path.join(
        this.projectPath,
        "src/interface/http/routes/auth.routes.ts"
      ),
      await fs.readFile(
        path.join(__dirname, "../templates/interface/auth-routes.ts"),
        "utf-8"
      )
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
    let envContent = "";

    if (await fs.pathExists(envPath)) {
      envContent = await fs.readFile(envPath, "utf-8");

      if (!envContent.includes("JWT_SECRET=")) {
        envContent += "\nJWT_SECRET=your_jwt_secret_key_here\n";
      }

      if (!envContent.includes("JWT_EXPIRES_IN=")) {
        envContent += "JWT_EXPIRES_IN=7d\n";
      }
    } else {
      envContent = "JWT_SECRET=your_jwt_secret_key_here\nJWT_EXPIRES_IN=7d\n";
    }

    await fs.writeFile(envPath, envContent);
  }
}