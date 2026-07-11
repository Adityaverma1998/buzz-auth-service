import { Router } from "express"
import jwt from "jsonwebtoken"
import { AppDataSource } from "../config/data-source.ts"
import { UserEventLog } from "../entities/UserEventLog.ts"
import { UserEventLogController } from "../controllers/UserEventLogController.ts"
import { Config } from "../config/index.ts"

const router = Router()

// Dependency Injection
const eventRepository = AppDataSource.getRepository(UserEventLog)
const eventController = new UserEventLogController(eventRepository)

/**
 * Optional authentication middleware for client-side event tracking.
 * If a valid JWT token is provided in the Authorization header, decodes and attaches it.
 * If no token or an invalid token is provided, lets the request proceed anonymously.
 */
const optionalAuth = (req: any, _res: any, next: any) => {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1]
        if (token) {
            try {
                const decoded = jwt.verify(token, Config.JWT_SECRET)
                req.auth = decoded
            } catch (err) {
                // Do not block the request on invalid tokens
            }
        }
    }
    next()
}

router.post("/", optionalAuth, (req, res, next) => eventController.logEvent(req, res, next))

export default router
