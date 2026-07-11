import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "../entities/User.ts"
import { UserDevice } from "../entities/UserDevice.ts"
import { Category } from "../entities/Category.ts"
import { Brand } from "../entities/Brand.ts"
import { Attribute } from "../entities/Attribute.ts"
import { AttributeValue } from "../entities/AttributeValue.ts"
import { Product } from "../entities/Product.ts"
import { ProductImage } from "../entities/ProductImage.ts"
import { ProductVariant } from "../entities/ProductVariant.ts"
import { Config } from "./index.ts"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: Config.DB_HOST!,
    port: Number(Config.DB_PORT),
    username: Config.DB_USER!,
    password: Config.DB_PASSWORD!,
    database: Config.DB_DATABASE!,

    // Don't use this in production 
    synchronize: true,
    logging: false,
    entities: [
        User,
        UserDevice,
        Category,
        Brand,
        Attribute,
        AttributeValue,
        Product,
        ProductImage,
        ProductVariant
    ],
    migrations: [],
    subscribers: [],
})

