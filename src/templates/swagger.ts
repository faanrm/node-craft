import { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

interface SwaggerOptions {
  swaggerDefinition: {
    openapi: string;
    info: {
      title: string;
      version: string;
      description: string;
      contact: {
        name: string;
      };
    };
    servers: Array<{
      url: string;
      description: string;
    }>;
    components: {
      securitySchemes: {
        bearerAuth: {
          type: string;
          scheme: string;
          bearerFormat: string;
        };
      };
    };
    security: Array<{
      bearerAuth: string[];
    }>;
  };
  apis: string[];
}

export const setupSwagger = (app: Express): void => {
  const swaggerOptions: SwaggerOptions = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "API Documentation",
        version: "1.0.0",
        description: "API documentation for the Node.js application",
        contact: {
          name: "API Support",
        },
      },
      servers: [
        {
          url: "/api",
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: [], 
  };

  app.use("/api-docs", (req, res, next) => {
    if (req.path === "/" || req.path === "/index.html") {
      const routesDir = path.join(process.cwd(), "src/routes");
      const modelsDir = path.join(process.cwd(), "src/models");
      
      let routeFiles: string[] = [];
      let modelFiles: string[] = [];
      
      if (fs.existsSync(routesDir)) {
        routeFiles = fs.readdirSync(routesDir)
          .filter(file => file.endsWith('.ts'))
          .map(file => path.join(routesDir, file));
      }
      
      if (fs.existsSync(modelsDir)) {
        modelFiles = fs.readdirSync(modelsDir)
          .filter(file => file.endsWith('.ts'))
          .map(file => path.join(modelsDir, file));
      }
      
      swaggerOptions.apis = [...routeFiles, ...modelFiles];
      
      const specs = swaggerJsdoc(swaggerOptions);
      
      const swaggerHtml = swaggerUi.generateHTML(specs, {
        customCss: `
          .swagger-ui .topbar { display: none }
          .swagger-ui .info { margin-top: 0 }
        `,
        customSiteTitle: "API Documentation",
      });
      
      res.send(swaggerHtml);
    } else if (req.path === "/swagger.json") {
      const routesDir = path.join(process.cwd(), "src/routes");
      const modelsDir = path.join(process.cwd(), "src/models");
      
      let routeFiles: string[] = [];
      let modelFiles: string[] = [];
      
      if (fs.existsSync(routesDir)) {
        routeFiles = fs.readdirSync(routesDir)
          .filter(file => file.endsWith('.ts'))
          .map(file => path.join(routesDir, file));
      }
      
      if (fs.existsSync(modelsDir)) {
        modelFiles = fs.readdirSync(modelsDir)
          .filter(file => file.endsWith('.ts'))
          .map(file => path.join(modelsDir, file));
      }
      
      swaggerOptions.apis = [...routeFiles, ...modelFiles];
      const specs = swaggerJsdoc(swaggerOptions);
      
      res.json(specs);
    } else {
      swaggerUi.serve(req, res, next);
    }
  });
  
  app.get("/api-docs/refresh", (req, res) => {
    res.json({ 
      message: "Swagger documentation will be refreshed on next visit to /api-docs",
      timestamp: new Date().toISOString()
    });
  });
};