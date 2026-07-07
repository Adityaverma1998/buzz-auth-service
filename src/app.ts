import express from 'express';
import logger from './logger.ts';
import type { Request, Response, NextFunction } from 'express';
import "reflect-metadata";
import authRouter from "./routes/authRouter.ts";
import { ZodError } from "zod";
import type { ZodIssue } from "zod";

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello World maza a gya h !");
});

// Mount authentication router
app.use("/api/v1/auth", authRouter);

// Global Error Handler Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // Handle Zod validation errors
    if (err instanceof ZodError) {
        logger.warn('Validation Error', { errors: err.issues });
        res.status(400).json({
            errors: err.issues.map((issue: ZodIssue) => ({
                field: issue.path.join('.'),
                message: issue.message
            }))
        });
        return;
    }

    logger.error('Error occurred', err);

    const statusCode = err.statusCode || err.status || 500;
    const response: { message: string; stack?: string } = {
        message: err.message || 'Internal Server Error'
    };

    if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(statusCode).json({
        errors: [
            {
                type: err.name || 'InternalServerError',
                ...response
            }
        ]
    });
});

export default app;
