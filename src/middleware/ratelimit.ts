import { rateLimit } from "express-rate-limit";
import type { Request } from "express";


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => req.ip ?? "unknown",
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
  })

export default limiter