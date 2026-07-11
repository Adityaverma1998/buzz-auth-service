import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from "typeorm"
import { Attribute } from "./Attribute.ts"

@Entity()
export class AttributeValue {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ type: "varchar" })
    value!: string

    @ManyToOne(() => Attribute, (attribute) => attribute.values, { onDelete: "CASCADE" })
    attribute!: Attribute
}
