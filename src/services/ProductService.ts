import type { Repository } from "typeorm";
import { Product, ProductStatus } from "../entities/Product.ts";
import { ProductImage } from "../entities/ProductImage.ts";
import { ProductVariant } from "../entities/ProductVariant.ts";
import { Category } from "../entities/Category.ts";
import { Brand } from "../entities/Brand.ts";
import createHttpError from "http-errors";
import type {
    CreateProductInput,
    UpdateProductInput,
    ProductQueryInput,
    CreateVariantInput,
    UpdateVariantInput
} from "../validators/productValidator.ts";

export class ProductService {
    private productRepository: Repository<Product>;
    private imageRepository: Repository<ProductImage>;
    private variantRepository: Repository<ProductVariant>;
    private categoryRepository: Repository<Category>;
    private brandRepository: Repository<Brand>;

    constructor(
        productRepository: Repository<Product>,
        imageRepository: Repository<ProductImage>,
        variantRepository: Repository<ProductVariant>,
        categoryRepository: Repository<Category>,
        brandRepository: Repository<Brand>
    ) {
        this.productRepository = productRepository;
        this.imageRepository = imageRepository;
        this.variantRepository = variantRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
    }

    // ───────────────── Product CRUD ─────────────────

    async create(input: CreateProductInput, userId: number): Promise<Product> {
        // Validate uniqueness
        const existingSlug = await this.productRepository.findOne({ where: { slug: input.slug } });
        if (existingSlug) {
            throw new createHttpError.Conflict(`Product with slug '${input.slug}' already exists`);
        }

        const existingSku = await this.productRepository.findOne({ where: { sku: input.sku } });
        if (existingSku) {
            throw new createHttpError.Conflict(`Product with SKU '${input.sku}' already exists`);
        }

        // Validate category
        if (input.categoryId) {
            const category = await this.categoryRepository.findOne({ where: { id: input.categoryId } });
            if (!category) throw new createHttpError.NotFound("Category not found");
        }

        // Validate brand
        if (input.brandId) {
            const brand = await this.brandRepository.findOne({ where: { id: input.brandId } });
            if (!brand) throw new createHttpError.NotFound("Brand not found");
        }

        const product = new Product();
        product.name = input.name;
        product.slug = input.slug;
        product.sku = input.sku;
        product.price = input.price;
        product.stock = input.stock ?? 0;
        product.minStock = input.minStock ?? 0;
        product.taxPercentage = input.taxPercentage ?? 0;
        product.status = (input.status as ProductStatus) ?? ProductStatus.DRAFT;
        product.featured = input.featured ?? false;
        product.isActive = input.isActive ?? true;

        if (input.shortDescription !== undefined) product.shortDescription = input.shortDescription;
        if (input.description !== undefined) product.description = input.description;
        if (input.barcode !== undefined) product.barcode = input.barcode;
        if (input.categoryId !== undefined) product.categoryId = input.categoryId;
        if (input.subCategoryId !== undefined) product.subCategoryId = input.subCategoryId;
        if (input.brandId !== undefined) product.brandId = input.brandId;
        if (input.salePrice !== undefined) product.salePrice = input.salePrice;
        if (input.costPrice !== undefined) product.costPrice = input.costPrice;
        if (input.weight !== undefined) product.weight = input.weight;
        if (input.length !== undefined) product.length = input.length;
        if (input.width !== undefined) product.width = input.width;
        if (input.height !== undefined) product.height = input.height;
        if (input.unit !== undefined) product.unit = input.unit;
        if (input.thumbnail !== undefined) product.thumbnail = input.thumbnail;

        product.createdBy = { id: userId } as any;
        product.updatedBy = { id: userId } as any;

        return await this.productRepository.save(product);
    }

    async findAll(query: ProductQueryInput): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
        const { page, limit, sortBy, order, search, category, brand, minPrice, maxPrice, status, featured } = query;
        const skip = (page - 1) * limit;

        // Build query builder for advanced filtering
        const qb = this.productRepository.createQueryBuilder("product")
            .leftJoinAndSelect("product.category", "category")
            .leftJoinAndSelect("product.brand", "brand")
            .leftJoinAndSelect("product.images", "images");

        if (category) qb.andWhere("product.categoryId = :category", { category });
        if (brand) qb.andWhere("product.brandId = :brand", { brand });
        if (status) qb.andWhere("product.status = :status", { status });
        if (featured !== undefined) qb.andWhere("product.featured = :featured", { featured });

        if (minPrice !== undefined && maxPrice !== undefined) {
            qb.andWhere("product.price BETWEEN :minPrice AND :maxPrice", { minPrice, maxPrice });
        } else if (minPrice !== undefined) {
            qb.andWhere("product.price >= :minPrice", { minPrice });
        } else if (maxPrice !== undefined) {
            qb.andWhere("product.price <= :maxPrice", { maxPrice });
        }

        if (search) {
            qb.andWhere(
                "(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)",
                { search: `%${search}%` }
            );
        }

        qb.orderBy(`product.${sortBy}`, order)
            .skip(skip)
            .take(limit);

        const [data, total] = await qb.getManyAndCount();

        return { data, total, page, limit };
    }

    async findById(id: string): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: { category: true, brand: true, images: true, variants: true, createdBy: true }
        });
        if (!product) {
            throw new createHttpError.NotFound("Product not found");
        }
        return product;
    }

    async findByCategory(categoryId: string, query: ProductQueryInput): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
        return this.findAll({ ...query, category: categoryId });
    }

    async findByBrand(brandId: string, query: ProductQueryInput): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
        return this.findAll({ ...query, brand: brandId });
    }

    async update(id: string, input: UpdateProductInput, userId: number): Promise<Product> {
        const product = await this.findById(id);

        // Validate slug uniqueness on change
        if (input.slug && input.slug !== product.slug) {
            const existing = await this.productRepository.findOne({ where: { slug: input.slug } });
            if (existing) throw new createHttpError.Conflict(`Product with slug '${input.slug}' already exists`);
        }

        // Validate SKU uniqueness on change
        if (input.sku && input.sku !== product.sku) {
            const existing = await this.productRepository.findOne({ where: { sku: input.sku } });
            if (existing) throw new createHttpError.Conflict(`Product with SKU '${input.sku}' already exists`);
        }

        // Validate category if changed
        if (input.categoryId) {
            const category = await this.categoryRepository.findOne({ where: { id: input.categoryId } });
            if (!category) throw new createHttpError.NotFound("Category not found");
        }

        // Validate brand if changed
        if (input.brandId) {
            const brand = await this.brandRepository.findOne({ where: { id: input.brandId } });
            if (!brand) throw new createHttpError.NotFound("Brand not found");
        }

        Object.assign(product, input);
        (product as any).updatedBy = { id: userId };

        return await this.productRepository.save(product);
    }

    async updateStatus(id: string, status: ProductStatus): Promise<Product> {
        const product = await this.findById(id);
        product.status = status;
        return await this.productRepository.save(product);
    }

    async softDelete(id: string): Promise<void> {
        const product = await this.findById(id);
        await this.productRepository.softRemove(product);
    }

    // ───────────────── Product Images ─────────────────

    async addImages(productId: string, files: Express.Multer.File[]): Promise<ProductImage[]> {
        const product = await this.findById(productId);

        const existingCount = await this.imageRepository.count({ where: { product: { id: productId } } });

        const images = files.map((file, index) => {
            const image = new ProductImage();
            image.product = product;
            image.imageUrl = `/uploads/${file.filename}`;
            image.displayOrder = existingCount + index;
            image.isPrimary = existingCount === 0 && index === 0; // First image is primary if none exist
            return image;
        });

        return await this.imageRepository.save(images);
    }

    async deleteImage(imageId: string): Promise<void> {
        const image = await this.imageRepository.findOne({ where: { id: imageId } });
        if (!image) {
            throw new createHttpError.NotFound("Image not found");
        }
        await this.imageRepository.remove(image);
    }

    // ───────────────── Product Variants ─────────────────

    async addVariant(productId: string, input: CreateVariantInput): Promise<ProductVariant> {
        const product = await this.findById(productId);

        const variant = new ProductVariant();
        variant.product = product;
        variant.variantName = input.variantName;
        variant.price = input.price ?? 0;
        variant.stock = input.stock ?? 0;
        if (input.sku !== undefined) variant.sku = input.sku;
        if (input.salePrice !== undefined) variant.salePrice = input.salePrice;
        if (input.attributes !== undefined) variant.attributes = input.attributes;

        return await this.variantRepository.save(variant);
    }

    async updateVariant(variantId: string, input: UpdateVariantInput): Promise<ProductVariant> {
        const variant = await this.variantRepository.findOne({ where: { id: variantId } });
        if (!variant) {
            throw new createHttpError.NotFound("Variant not found");
        }
        Object.assign(variant, input);
        return await this.variantRepository.save(variant);
    }

    async deleteVariant(variantId: string): Promise<void> {
        const variant = await this.variantRepository.findOne({ where: { id: variantId } });
        if (!variant) {
            throw new createHttpError.NotFound("Variant not found");
        }
        await this.variantRepository.remove(variant);
    }
}
