import app from "./app.ts"
import { Config } from "./config/index.ts";
import logger from "./logger.ts";
import { AppDataSource } from "./config/data-source.ts";

const startServer = async () => {
    try {
        // Initialize database connection
        logger.info("Initializing database connection...");
        await AppDataSource.initialize();
        logger.info("Database connection established successfully!");

        // Start listening
        app.listen(Config.PORT, () => {
            logger.info(`Server is running on port ${Config.PORT}`);
            console.log(`Server is running on port ${Config.PORT}`);
        });
    } catch (err) {
        logger.error("Error starting server:", err);
        console.error("Error starting server:", err);
        process.exit(1);
    }
}

startServer();
