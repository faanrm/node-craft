import { describe, it, expect, afterAll } from "vitest";
import fs from "fs-extra";
import path from "path";
import { generateProject, cleanScope } from "../helpers/generate.js";

const SCOPE = "other-orms";

afterAll(async () => {
  await cleanScope(SCOPE);
});

describe("TypeORM + Express", () => {
  it("generates with PostgreSQL + REST + Auth", async () => {
    const projectPath = await generateProject({
      scope: SCOPE,
      projectName: "test-typeorm-pg",
      framework: "Express",
      database: "PostgreSQL",
      orm: "TypeORM",
      enableAuthentication: true,
      enableGraphql: false,
      enableRest: true,
    });

    expect(await fs.pathExists(path.join(projectPath, "package.json"))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, "src"))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, "node-craft.json"))).toBe(true);

    const pkg = await fs.readJSON(path.join(projectPath, "package.json"));
    expect(pkg.dependencies).toHaveProperty("typeorm");
  });
});

describe("Sequelize + Express", () => {
  it("generates with MySQL + REST (no auth)", async () => {
    const projectPath = await generateProject({
      scope: SCOPE,
      projectName: "test-sequelize-mysql",
      framework: "Express",
      database: "MySQL",
      orm: "Sequelize",
      enableAuthentication: false,
      enableGraphql: false,
      enableRest: true,
    });

    expect(await fs.pathExists(path.join(projectPath, "package.json"))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, "src"))).toBe(true);

    const pkg = await fs.readJSON(path.join(projectPath, "package.json"));
    expect(pkg.dependencies).toHaveProperty("sequelize");
    expect(pkg.dependencies).toHaveProperty("mysql2");
  });
});
