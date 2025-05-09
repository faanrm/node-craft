import path from "path";
import fs from "fs-extra";
export class Package {
  private projectPath!: string;
  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }
  async generatePackageJson() {
    const packageJson = {
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
        express: "^4.18.2",
        prisma: "^5.2.0",
        zod: "^3.22.2",
        helmet: "^8.1.0",
        morgan: "^1.10.0",
        cors: "^2.8.5",
        winston: "^3.8.2",
        "@prisma/client": "^6.5.0",
        dotenv: "^16.0.3",
        "express-rate-limit": "^6.7.0",
        "xss-clean": "^0.1.4",
        "swagger-jsdoc": "^6.2.8",
        "swagger-ui-express": "^4.6.3",
      },
      devDependencies: {
        "@types/express": "^4.17.17",
        "@types/node": "^20.6.0",
        nodemon: "^3.0.1",
        "@types/swagger-jsdoc": "^6.0.1",
        "@types/swagger-ui-express": "^4.1.3",
        "@types/cors": "^2.8.17",
        "@types/jsonwebtoken": "^9.0.9",
        "@types/morgan": "^1.9.9",
        "ts-node": "^10.9.2",
        typescript: "^5.2.2",
      },
    };
    await fs.writeJSON(
      path.join(this.projectPath, "package.json"),
      packageJson,
      { spaces: 2 }
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
