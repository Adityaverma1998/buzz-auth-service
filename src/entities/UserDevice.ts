import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { User } from "./User.ts"

@Entity()
export class UserDevice {
    @PrimaryGeneratedColumn()
    id!: number

    // Unique per-device notification token
    @Column({ type: "varchar", unique: true })
    fcmToken!: string

    // Many devices belong to one user
    @ManyToOne(() => User, (user) => user.devices, { onDelete: "CASCADE" })
    user!: User

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
