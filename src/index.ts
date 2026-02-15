import { Template } from "./commands/template";
import { Package } from "./commands/package";
import { Prisma } from "./commands/prisma";
import { Project } from "./commands/project";
import { CLI } from "./commands/main";
import { Authentication } from "./commands/authentication";
import { Add } from "./commands/add";

const projectPath = "";
const packageService = new Package(projectPath);
const prismaService = new Prisma(projectPath);
const templateService = new Template(projectPath, prismaService);
const authService = new Authentication(projectPath);
const project = new Project(
  authService,
  packageService,
  prismaService,
  templateService,
  projectPath,
);
const add = new Add(
  authService,
  packageService,
  prismaService,
  templateService
);


new CLI(project, add);