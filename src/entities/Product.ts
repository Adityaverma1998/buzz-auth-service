import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    Index
} from "typeorm"
import { Category } from "./Category.ts"
import { Brand } from "./Brand.ts"
import { User } from "./User.ts"
import { ProductImage } from "./ProductImage.ts"
import { ProductVariant } from "./ProductVariant.ts"

export enum ProductStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    DRAFT = "DRAFT"
}

@Entity()
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ type: "varchar" })
    name!: string

    @Index({ unique: true })
    @Column({ type: "varchar", unique: true })
    slug!: string

    @Column({ type: "varchar", nullable: true })
    shortDescription?: string

    @Column({ type: "text", nullable: true })
    description?: string

    @Index({ unique: true })
    @Column({ type: "varchar", unique: true })
    sku!: string

    @Column({ type: "varchar", nullable: true })
    barcode?: string

    // Relations
    @ManyToOne(() => Category, { nullable: true, onDelete: "SET NULL" })
    category?: Category

    @Column({ type: "uuid", nullable: true })
    categoryId?: string

    @ManyToOne(() => Category, { nullable: true, onDelete: "SET NULL" })
    subCategory?: Category

    @Column({ type: "uuid", nullable: true })
    subCategoryId?: string

    @ManyToOne(() => Brand, { nullable: true, onDelete: "SET NULL" })
    brand?: Brand

    @Column({ type: "uuid", nullable: true })
    brandId?: string

    // Pricing
    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    price!: number

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    salePrice?: number

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    costPrice?: number

    // Inventory
    @Column({ type: "int", default: 0 })
    stock!: number

    @Column({ type: "int", default: 0 })
    minStock!: number

    // Physical attributes
    @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
    weight?: number

    @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
    length?: number

    @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
    width?: number

    @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
    height?: number

    @Column({ type: "varchar", nullable: true })
    unit?: string

    // Tax
    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    taxPercentage!: number

    // Status & visibility
    @Column({ type: "enum", enum: ProductStatus, default: ProductStatus.DRAFT })
    status!: ProductStatus

    @Column({ type: "boolean", default: false })
    featured!: boolean

    @Column({ type: "boolean", default: true })
    isActive!: boolean

    @Column({ type: "varchar", nullable: true })
    thumbnail?: string

    // Audit relationships
    @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
    createdBy?: User

    @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
    updatedBy?: User

    // Child relations
    @OneToMany(() => ProductImage, (image) => image.product)
    images!: ProductImage[]

    @OneToMany(() => ProductVariant, (variant) => variant.product)
    variants!: ProductVariant[]

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date

    @DeleteDateColumn()
    deletedAt?: Date
}
