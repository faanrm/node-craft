
import { Template } from "./commands/template";
import { Package } from "./commands/package";
import { Prisma } from "./commands/prisma";
import { Project } from "./commands/project";
import { CLI } from "./commands/main";
import path from "path";

const args = process.argv.slice(2);
const projectPath = args[0] ? path.resolve(args[0]) : path.resolve('./');

const packageService = new Package(projectPath);
const prismaService = new Prisma(projectPath);
const templateService = new Template(projectPath);
const project = new Project(packageService, prismaService, templateService,projectPath);

new CLI(project);