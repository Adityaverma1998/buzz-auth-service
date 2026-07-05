import app from "./app.ts"
import { Config } from "./config/index.ts";
import logger from "./logger.ts";



const startServer = ()=>{
    try{
        app.listen(Config.PORT,()=>{
            logger.info(`Server is running on port ${Config.PORT}`)
            console.log(`Server is running on port ${Config.PORT}`);
        })
    }catch(err){
        console.error("Error starting server",err);
        process.exit(1);
    }
}

startServer();
