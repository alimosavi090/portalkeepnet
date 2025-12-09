import winston from "winston";
import path from "path";

const logDir = "logs";

// Create logs directory if it doesn't exist
import fs from "fs";
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: logFormat,
    defaultMeta: { service: "secure-datavault" },
    transports: [
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(logDir, "combined.log"),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write errors to error.log
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});

// Add console transport in development
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    );
}

// Helper functions
export const log = {
    info: (message: string, meta?: any) => logger.info(message, meta),
    error: (message: string, meta?: any) => logger.error(message, meta),
    warn: (message: string, meta?: any) => logger.warn(message, meta),
    debug: (message: string, meta?: any) => logger.debug(message, meta),
};
