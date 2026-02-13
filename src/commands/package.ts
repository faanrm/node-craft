import path from "path";
import fs from "fs-extra";
export class Package {
  private projectPath!: string;
  private framework: 'Express' | 'Fastify' = 'Express';
  private isGraphql: boolean = false;
  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }
  setProjectPath(projectPath: string, framework?: 'Express' | 'Fastify', isGraphql?: boolean) {
    this.projectPath = projectPath;
    if (framework !== undefined) this.framework = framework;
    if (isGraphql !== undefined) this.isGraphql = isGraphql;
  }
  async generatePackageJson() {
    const packageJson: any = {
      name: path.basename(this.projectPath),
      description: "Generated project by node-craft",
      main: "dist/index.ts",
      scripts: {
        start: "nodemon",
        build: "tsc",
        generate: "prisma generate",
        migrate: "prisma db push",
      },
      dependencies: {
        prisma: "^5.2.0",
        zod: "^3.22.2",
        winston: "^3.8.2",
        "@prisma/client": "^6.5.0",
        dotenv: "^16.0.3",
        "fs-extra": "^11.3.0",
      },
      devDependencies: {
        "@types/node": "^20.6.0",
        nodemon: "^3.0.1",
        "@types/fs-extra": "^11.0.4",
        "ts-node": "^10.9.2",
        typescript: "^5.2.2",
      },
    };

    if (this.framework === "Express") {
      packageJson.dependencies = {
        ...packageJson.dependencies,
        express: "^4.18.2",
        helmet: "^8.1.0",
        morgan: "^1.10.0",
        cors: "^2.8.5",
        "express-rate-limit": "^6.7.0",
        "xss-clean": "^0.1.4",
      };
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        "@types/express": "^4.17.17",
        "@types/cors": "^2.8.17",
        "@types/morgan": "^1.9.9",
      };
    } else if (this.framework === "Fastify") {
      packageJson.dependencies = {
        ...packageJson.dependencies,
        fastify: "^4.24.3",
        "@fastify/cors": "^8.4.1",
        "@fastify/helmet": "^11.1.1",
      };
    }

    if (this.isGraphql) {
      if (this.framework === "Express") {
        packageJson.dependencies = {
          ...packageJson.dependencies,
          "@apollo/server": "^4.7.1",
          graphql: "^16.6.0",
        };
      } else if (this.framework === "Fastify") {
        packageJson.dependencies = {
          ...packageJson.dependencies,
          "@apollo/server": "^4.7.1",
          graphql: "^16.6.0",
          "@as-integrations/fastify": "^2.1.1",
        };
      }
    }
    await fs.writeJSON(
      path.join(this.projectPath, "package.json"),
      packageJson,
      { spaces: 2 },
    );
  }
  async createTsConfig() {
    const tsConfig = {
      compilerOptions: {
        target: "esnext",
        lib: ["dom", "esnext"],
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        module: "NodeNext",
        moduleResolution: "nodenext",
        sourceMap: true,
        noImplicitAny: true,
        baseUrl: "src",
        outDir: "dist",
      },
      include: ["./src/**/*"],
    };
    await fs.writeJSON(path.join(this.projectPath, "tsconfig.json"), tsConfig, {
      spaces: 2,
    });
  }
}
