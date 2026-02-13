export interface NodeCraftConfig {
  projectName: string;
  framework: 'Express' | 'Fastify';
  database: 'PostgreSQL' | 'MySQL' | 'MongoDB';
  features: {
    authentication: boolean;
    graphql: boolean;
    rest: boolean;
  };
  createdAt: string;
  version: string;
}
