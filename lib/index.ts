import { Template } from "./commands/template";
import { Package } from "./commands/package";
import { Prisma } from "./commands/prisma";
import { Project } from "./commands/project";
import { CLI } from "./commands/main";
import { Authentification } from "./commands/authentification";


const projectPath = '';
const packageService = new Package(projectPath);
const prismaService = new Prisma(projectPath);
const templateService = new Template(projectPath);
const authService = new Authentification(projectPath);
const project = new Project(authService, packageService, prismaService, templateService, projectPath);

new CLI(project);