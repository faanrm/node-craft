import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xssClean from 'xss-clean';
import { Express } from 'express';

export const setupSecurity = (app: Express): void => {
  app.use(helmet());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    standardHeaders: true, 
    legacyHeaders: false, 
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });
  app.use('/api', limiter);

  app.use(xssClean());
};