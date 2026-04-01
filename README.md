<div align="center">
  <h1>🚀 Node-Craft</h1>
  <p><strong>The Ultimate Low-Code / No-Code Node.js Project Generator</strong></p>
  <p>Instantly scaffold production-ready backend applications with Express or Fastify, Prisma or TypeORM, GraphQL or REST, and built-in JWT Authentication.</p>

  [![npm version](https://img.shields.io/npm/v/@krakennn/node-craft.svg?style=flat-square)](https://www.npmjs.com/package/@krakennn/node-craft)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
</div>


### Key Features
- **Framework Flexibility**: Choose between **Express** or **Fastify**.
- **Database Agnostic**: Support for **PostgreSQL**, **MySQL**, and **MongoDB**.
- **Top-Tier ORMs**: Integrated with **Prisma**, **TypeORM**, **Sequelize**, or **Mongoose**.
-**API Styles**: Automatically generate **REST APIs** or **GraphQL** (Apollo Server v4).
-**Turnkey Security**: Pre-configured JWT authentication, bcrypt hashing, Helmet, and CORS.
-**Data Modeling**: Design your models directly in the CLI. Node-Craft will automatically generate the corresponding Prisma schemas, interfaces, controllers, and services for you.
-**Strict TypeScript**: 100% typed output, from GraphQL resolvers to Request/Response objects.

---

## 💻 Quick Start

You can generate a new project instantly using `npx` (no installation required):

```bash
npx @krakennn/node-craft@latest create
```

### Global Installation

If you generate projects often, install it globally:

```bash
npm install -g @krakennn/node-craft@latest
# or using yarn
yarn global add @krakennn/node-craft@latest
```

Then run the CLI wizard from anywhere:

```bash
node-craft create
```

---

## Adding New Models

Once you have generated your `node-craft` project, you don't have to start over to add a new model.
Navigate inside your generated project directory (where `node-craft.json` is located) and run:

```bash
node-craft add
```

This will launch the interactive wizard again specifically to add a **new entity** (like a `Post`, `Comment`, `Order`) to your *existing* project. Node-Craft will intelligently generate the new Controller, Service, Interfaces, and update your Prisma/TypeORM schema without overwriting your existing code!

After adding the module, remember to update your database:
```bash
npm run generate
npm run migrate
```
