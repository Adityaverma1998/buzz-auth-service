import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: "varchar" })
    firstName!: string

    @Column({ type: "varchar" })
    lastName!: string

    @Column({ type: "varchar", unique: true })
    email!: string

    @Column({ type: "varchar", nullable: true })
    password?: string

    @Column({ type: "varchar", nullable: true })
    phone?: string

    // E.g., 'local', 'google', 'github', 'facebook'
    @Column({ type: "varchar", default: 'local' })
    provider!: string

    // The unique user ID returned by the OAuth provider (e.g. Google profile ID, GitHub user ID)
    @Column({ type: "varchar", nullable: true })
    providerUserId?: string

    @Column({
        type: "enum",
        enum: ["admin", "customer"],
        default: "customer"
    })
    role!: "admin" | "customer"

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
