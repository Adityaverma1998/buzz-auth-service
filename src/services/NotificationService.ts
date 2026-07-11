import type { Repository } from "typeorm"
import { UserDevice } from "../entities/UserDevice.ts"
import { firebaseApp } from "../config/firebase.ts"
import { getMessaging } from "firebase-admin/messaging"
import logger from "../logger.ts"

export class NotificationService {
    private deviceRepository: Repository<UserDevice>

    constructor(deviceRepository: Repository<UserDevice>) {
        this.deviceRepository = deviceRepository
    }

    /**
     * Send a push notification to all registered devices of a user via Firebase Cloud Messaging.
     */
    async sendPushToUser(
        userId: number,
        title: string,
        body: string,
        dataPayload?: Record<string, string>
    ): Promise<void> {
        try {
            // Check if Firebase is initialized
            if (!firebaseApp) {
                logger.warn(`Firebase Admin SDK is not initialized. Skipping push to user ${userId}.`)
                return
            }

            // Retrieve all active device tokens for the user
            const devices = await this.deviceRepository.find({
                where: { user: { id: userId } }
            })

            const tokens = devices.map(d => d.fcmToken).filter(Boolean) as string[]

            if (tokens.length === 0) {
                logger.info(`No registered device tokens found for user ${userId}.`)
                return
            }

            const messaging = getMessaging(firebaseApp)

            const payload: any = {
                tokens,
                notification: {
                    title,
                    body
                }
            }
            if (dataPayload !== undefined) {
                payload.data = dataPayload
            }

            // Send notification multicast to all device tokens of the user
            const response = await messaging.sendEachForMulticast(payload)

            // Clean up invalid or stale tokens returned by FCM to prevent database pollution
            const tokensToDelete: string[] = []
            response.responses.forEach((res, index) => {
                if (!res.success && res.error) {
                    const errorCode = res.error.code
                    const targetToken = tokens[index]!
                    if (
                        errorCode === "messaging/registration-token-not-registered" ||
                        errorCode === "messaging/invalid-registration-token" ||
                        errorCode === "messaging/invalid-argument"
                    ) {
                        logger.info(`FCM token expired or invalid; marking for deletion: ${targetToken}`)
                        tokensToDelete.push(targetToken)
                    } else {
                        logger.error(`FCM error for token ${targetToken}:`, res.error)
                    }
                }
            })

            if (tokensToDelete.length > 0) {
                await this.deviceRepository
                    .createQueryBuilder()
                    .delete()
                    .from(UserDevice)
                    .where("fcmToken IN (:...tokensToDelete)", { tokensToDelete })
                    .execute()
                logger.info(`Successfully deleted ${tokensToDelete.length} stale FCM tokens.`)
            }

            logger.info(`Successfully sent FCM notifications to user ${userId}. Success: ${response.successCount}, Failures: ${response.failureCount}`)
        } catch (error) {
            logger.error(`Failed to send push notification to user ${userId}:`, error)
        }
    }
}
