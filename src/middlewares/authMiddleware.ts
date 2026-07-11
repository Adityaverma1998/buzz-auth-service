import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Config } from "../config/index.ts";
import createHttpError from "http-errors";

// Extend Express Request to include authenticated user payload
export interface AuthRequest extends Request {
    auth: {
        sub: number;
        role: string;
        email: string;
    };
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new createHttpError.Unauthorized("Missing or invalid Authorization header");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new createHttpError.Unauthorized("Token not provided");
        }

        const decoded = jwt.verify(token, Config.JWT_SECRET) as unknown as AuthRequest["auth"];
        (req as AuthRequest).auth = decoded;

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new createHttpError.Unauthorized("Invalid or expired token"));
        } else {
            next(error);
        }
    }
};
