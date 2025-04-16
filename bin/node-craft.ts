#!/usr/bin/env bun

import { Package } from "../src/commands/package";
import { Prisma } from "../src/commands/prisma";
import { Template } from "../src/commands/template";
import { Authentification } from "../src/commands/authentification";
import { Project } from "../src/commands/project";
import { CLI } from "../src/commands/main";
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
  projectPath
);

new CLI(project);
