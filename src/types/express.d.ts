import "express";
import { DecodedIdToken } from "firebase-admin/auth";

declare module "express" {
  export interface Request {
    decoded?: DecodedIdToken;
  }
}


declare global {
  namespace Express {
    interface Request {
      decoded?: DecodedIdToken;
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}