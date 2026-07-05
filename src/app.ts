import express from 'express';
import logger from './logger.ts';
import type { HttpError } from 'http-errors';
import type { Request, Response, NextFunction } from 'express';
import "reflect-metadata"



const app = express();

app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Hello World maza a gya h !");
});


app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error('Error', err);
    res.status(500).json({ errors: [
       { type: err.name,
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode, 
        status: err.status, }
        
    ] });
});


export default app;
