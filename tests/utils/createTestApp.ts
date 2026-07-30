import express, { type Application } from "express";
import { type Request, type Response, type NextFunction } from "express";

export const createTestApp = (
  routePath: string,
  router: ReturnType<typeof express.Router>,
): Application => {
  const app = express();
  app.use(express.json());

  const mockAuth = (req: Request, _res: Response, next: NextFunction) => {
    req.user = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "free_user",
    };
    next();
  };

  app.use(routePath, mockAuth, router);
  return app;
};
