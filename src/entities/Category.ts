import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    Index
} from "typeorm"

@Entity()
export class Category {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ type: "varchar" })
    name!: string

    @Index({ unique: true })
    @Column({ type: "varchar", unique: true })
    slug!: string

    @Column({ type: "varchar", nullable: true })
    icon?: string

    @Column({ type: "varchar", nullable: true })
    image?: string

    @Column({ type: "boolean", default: true })
    isActive!: boolean

    // Self-referencing relationship for nested categories
    @ManyToOne(() => Category, (category) => category.children, { nullable: true, onDelete: "SET NULL" })
    parent?: Category

    @Column({ type: "uuid", nullable: true })
    parentId?: string

    @OneToMany(() => Category, (category) => category.parent)
    children!: Category[]

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
