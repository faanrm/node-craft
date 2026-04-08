import { describe, it, expect, afterAll } from "vitest";
import fs from "fs-extra";
import path from "path";
import { generateProject, cleanScope } from "../helpers/generate.js";

const SCOPE = "prisma";

afterAll(async () => {
  await cleanScope(SCOPE);
});

describe("Prisma + Express", () => {
  it("generates with PostgreSQL + REST + Auth", async () => {
    const projectPath = await generateProject({
      scope: SCOPE,
      projectName: "test-prisma-express",
      framework: "Express",
      database: "PostgreSQL",
      orm: "Prisma",
      enableAuthentication: true,
      enableGraphql: false,
      enableRest: true,
    });

    expect(await fs.pathExists(path.join(projectPath, "package.json"))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, "prisma", "schema.prisma"))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, "src"))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, "tsconfig.json"))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, "node-craft.json"))).toBe(true);

    const pkg = await fs.readJSON(path.join(projectPath, "package.json"));
    expect(pkg.dependencies).toHaveProperty("express");
    expect(pkg.dependencies).toHaveProperty("@prisma/client");
  });

  it("generates with PostgreSQL + GraphQL + REST + Auth", async () => {
    const projectPath = await generateProject({
      scope: SCOPE,
      projectName: "test-prisma-graphql",
      framework: "Express",
      database: "PostgreSQL",
      orm: "Prisma",
      enableAuthentication: true,
      enableGraphql: true,
      enableRest: true,
    });

    expect(await fs.pathExists(path.join(projectPath, "src"))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, "prisma", "schema.prisma"))).toBe(true);

    const pkg = await fs.readJSON(path.join(projectPath, "package.json"));
    expect(pkg.dependencies).toHaveProperty("@apollo/server");
  });
});

describe("Prisma + Fastify", () => {
  it("generates with PostgreSQL + REST + Auth", async () => {
    const projectPath = await generateProject({
      scope: SCOPE,
      projectName: "test-prisma-fastify",
      framework: "Fastify",
      database: "PostgreSQL",
      orm: "Prisma",
      enableAuthentication: true,
      enableGraphql: false,
      enableRest: true,
    });

    expect(await fs.pathExists(projectPath)).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, "node-craft.json"))).toBe(true);

    const pkg = await fs.readJSON(path.join(projectPath, "package.json"));
    expect(pkg.dependencies).toHaveProperty("fastify");
  });
});
