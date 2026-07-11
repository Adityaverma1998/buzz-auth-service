import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import type { AuthRequest } from "./authMiddleware.ts";

/**
 * Higher-order middleware that restricts access to specified roles.
 * Usage: authorizeRoles("admin") or authorizeRoles("admin", "customer")
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const authReq = req as AuthRequest;

        if (!authReq.auth) {
            return next(new createHttpError.Unauthorized("Authentication required"));
        }

        if (!allowedRoles.includes(authReq.auth.role)) {
            return next(new createHttpError.Forbidden("You do not have permission to perform this action"));
        }

        next();
    };
};
