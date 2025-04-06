import { Template } from "./commands/template";
import { Package } from "./commands/package";
import { Prisma } from "./commands/prisma";
import { Project } from "./commands/project";
import { CLI } from "./commands/main";
import path from "path"
const projectPath = path.resolve('./');
const packageService = new Package();
const prismaService = new Prisma(projectPath);
const templateService = new Template();

const project = new Project(packageService, prismaService, templateService);

new CLI(project); 
