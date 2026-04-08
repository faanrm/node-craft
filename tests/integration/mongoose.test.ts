import { describe, it, expect, afterAll } from "vitest";
import fs from "fs-extra";
import path from "path";
import { generateProject, cleanScope } from "../helpers/generate.js";

const SCOPE = "mongoose";

afterAll(async () => {
  await cleanScope(SCOPE);
});

describe("Mongoose + Express", () => {
  it("generates with MongoDB + REST + Auth", async () => {
    const projectPath = await generateProject({
      scope: SCOPE,
      projectName: "test-mongoose-auth",
      framework: "Express",
      database: "MongoDB",
      orm: "Mongoose",
      enableAuthentication: true,
      enableGraphql: false,
      enableRest: true,
    });

    expect(await fs.pathExists(path.join(projectPath, "package.json"))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, "src"))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, "node-craft.json"))).toBe(true);

    const pkg = await fs.readJSON(path.join(projectPath, "package.json"));
    expect(pkg.dependencies).toHaveProperty("mongoose");
    expect(pkg.dependencies).toHaveProperty("express");
  });

  it("generates with MongoDB + GraphQL + Auth", async () => {
    const projectPath = await generateProject({
      scope: SCOPE,
      projectName: "test-mongoose-graphql",
      framework: "Express",
      database: "MongoDB",
      orm: "Mongoose",
      enableAuthentication: true,
      enableGraphql: true,
      enableRest: true,
    });

    expect(await fs.pathExists(path.join(projectPath, "src"))).toBe(true);

    const pkg = await fs.readJSON(path.join(projectPath, "package.json"));
    expect(pkg.dependencies).toHaveProperty("mongoose");
    expect(pkg.dependencies).toHaveProperty("@apollo/server");
  });
});
