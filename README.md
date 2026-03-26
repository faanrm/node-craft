# NodeCraft

NodeCraft is a powerful CLI and programmatic project scaffolding tool for Node.js. It helps you jumpstart your backend development by generating a modern, production-ready project structure in seconds.

## Key Features

- **Framework Flexibility**: Support for both **Express** and **Fastify**.
- **Modern GraphQL Support**: Integrated **Apollo Server v4** with correct `graphql-tag` imports.
- **Strict TypeScript Typing**:
  - Automatically generated interfaces for your models (`IUser`, `IDomain`, etc.).
  - Typed GraphQL resolvers using generated interfaces and inputs.
  - Standardized `GraphQLContext` for type-safe context handling.
- **Database Integration**: Built-in support for **Prisma**, **Mongoose**, **TypeORM**, and **Sequelize**.
- **Authentication**: One-step authentication setup including JWT, bcrypt, and middleware.
- **Project Structure**: Clean, modular architecture with separate layers for models, services, controllers, and GraphQL.

## Quick Start

Generate a new project with a single command:

```bash
npx @krakennn/node-craft my-awesome-api
```

### Installation (Global)

```bash
npm i -g @krakennn/node-craft
```

## How it Works

NodeCraft uses a template-based system (EJS) to generate your project. It can be used via CLI for interactive scaffolding or programmatically for integration into other tools.

