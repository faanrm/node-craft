#!/usr/bin/env bun
import { Template } from "../lib/commands/template";
import { Package } from "../lib/commands/package";
import { Prisma } from "../lib/commands/prisma";
import { Authentification } from "../lib/commands/authentification";
import { Project } from "../lib/commands/project";
const projectPath = "";
const packageService = new Package(projectPath);
const prismaService = new Prisma(projectPath);
const templateService = new Template(projectPath);
const authService = new Authentification(projectPath);
const project = new Project(
  authService,
  packageService,
  prismaService,
  templateService,
  projectPath,
);

new CLI(project);
