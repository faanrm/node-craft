#!/usr/bin/env bun
import { Template } from "../lib/commands/template";
import { Package } from "../lib/commands/package";
import { Prisma } from "../lib/commands/prisma";
import { Project } from "../lib/commands/project";
import path from "path";
import {CLI} from "../lib/commands/main";
const args = process.argv.slice(2);
const projectPath = args[0] ? path.resolve(args[0]) : path.resolve('./');

const packageService = new Package(projectPath);
const prismaService = new Prisma(projectPath);
const templateService = new Template(projectPath);
const project = new Project(packageService, prismaService, templateService, projectPath);

new CLI(project);
