import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index
} from "typeorm"

@Entity()
@Index(["userId", "createdAt"])
@Index(["eventType", "createdAt"])
@Index(["platform", "createdAt"])
export class UserEventLog {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ type: "int", nullable: true })
    userId?: number

    @Column({ type: "varchar" })
    eventType!: string // e.g. "page_view", "click", "search", "app_crash", "add_to_cart"

    @Column({ type: "varchar" })
    eventName!: string // e.g. "product_details", "search_button_click", "android_out_of_memory"

    @Column({ type: "varchar" })
    platform!: string // e.g. "web", "android", "ios"

    @Column({ type: "jsonb", nullable: true })
    metadata?: Record<string, unknown> // flexible extra details (e.g. url, product_id, query)

    @Column({ type: "varchar", nullable: true })
    ipAddress?: string

    @Column({ type: "varchar", nullable: true })
    userAgent?: string

    @CreateDateColumn()
    createdAt!: Date
}
