import { z } from "zod"

export const createUserEventLogSchema = z.object({
    eventType: z.string().min(1, "Event type is required"),
    eventName: z.string().min(1, "Event name is required"),
    platform: z.enum(["web", "android", "ios", "app"]),
    metadata: z.record(z.string(), z.any()).optional()
})

export type CreateUserEventLogInput = z.infer<typeof createUserEventLogSchema>
