import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
} from "typeorm"

@Entity()
export class Brand {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ type: "varchar" })
    name!: string

    @Column({ type: "varchar", nullable: true })
    logo?: string

    @Column({ type: "text", nullable: true })
    description?: string

    @Column({ type: "boolean", default: true })
    isActive!: boolean

    @CreateDateColumn()
    createdAt!: Date
}
