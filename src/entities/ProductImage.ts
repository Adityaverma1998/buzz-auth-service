import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne
} from "typeorm"
import { Product } from "./Product.ts"

@Entity()
export class ProductImage {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @ManyToOne(() => Product, (product) => product.images, { onDelete: "CASCADE" })
    product!: Product

    @Column({ type: "varchar" })
    imageUrl!: string

    @Column({ type: "int", default: 0 })
    displayOrder!: number

    @Column({ type: "boolean", default: false })
    isPrimary!: boolean

    @CreateDateColumn()
    createdAt!: Date
}
