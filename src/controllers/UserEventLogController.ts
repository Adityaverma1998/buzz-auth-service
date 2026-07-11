import type { Request, Response, NextFunction } from "express"
import type { Repository } from "typeorm"
import { UserEventLog } from "../entities/UserEventLog.ts"
import { createUserEventLogSchema } from "../validators/eventLogValidator.ts"

export class UserEventLogController {
    private eventRepository: Repository<UserEventLog>

    constructor(eventRepository: Repository<UserEventLog>) {
        this.eventRepository = eventRepository
    }

    /**
     * Records a new user event log from web or mobile apps.
     * Supports both anonymous guests and authenticated users.
     */
    async logEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validated = createUserEventLogSchema.parse(req.body)
            
            const log = new UserEventLog()
            log.eventType = validated.eventType
            log.eventName = validated.eventName
            log.platform = validated.platform
            
            if (validated.metadata !== undefined) {
                log.metadata = validated.metadata
            }

            // Extract optional userId if auth info is available on request
            const authPayload = (req as any).auth
            if (authPayload && authPayload.sub) {
                log.userId = authPayload.sub
            }

            // Capture request metadata
            const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress
            if (clientIp) {
                const ipValue = Array.isArray(clientIp) ? clientIp[0] : clientIp
                if (ipValue !== undefined) {
                    log.ipAddress = ipValue
                }
            }

            const userAgent = req.headers["user-agent"]
            if (userAgent !== undefined) {
                log.userAgent = userAgent
            }

            await this.eventRepository.save(log)

            res.status(201).json({
                success: true,
                message: "Event logged successfully"
            })
        } catch (error) {
            next(error)
        }
    }
}
