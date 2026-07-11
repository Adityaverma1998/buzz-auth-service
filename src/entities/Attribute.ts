import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm"
import { AttributeValue } from "./AttributeValue.ts"

@Entity()
export class Attribute {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ type: "varchar", unique: true })
    name!: string

    @OneToMany(() => AttributeValue, (value) => value.attribute)
    values!: AttributeValue[]
}
