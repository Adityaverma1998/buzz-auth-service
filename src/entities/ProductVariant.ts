import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne
} from "typeorm"
import { Product } from "./Product.ts"

@Entity()
export class ProductVariant {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @ManyToOne(() => Product, (product) => product.variants, { onDelete: "CASCADE" })
    product!: Product

    @Column({ type: "varchar" })
    variantName!: string

    @Column({ type: "varchar", nullable: true })
    sku?: string

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    price!: number

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    salePrice?: number

    @Column({ type: "int", default: 0 })
    stock!: number

    // Flexible key-value store for attributes like { "color": "Red", "size": "XL" }
    @Column({ type: "jsonb", nullable: true })
    attributes?: Record<string, string>

    @CreateDateColumn()
    createdAt!: Date
}
