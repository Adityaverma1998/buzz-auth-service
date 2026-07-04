import winston from "winston";

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', dirname:'logs',level: 'error' }),
    new winston.transports.File({ filename: 'combined.log',dirname:'logs',format:
        winston.format.combine(winston.format.timestamp(),winston.format.json()) }),
  ],
},

);

export default logger;