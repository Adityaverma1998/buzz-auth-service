import type { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/ProductService.ts";
import type { AuthRequest } from "../middlewares/authMiddleware.ts";
import { ProductStatus } from "../entities/Product.ts";
import {
    createProductSchema,
    updateProductSchema,
    updateProductStatusSchema,
    productQuerySchema,
    createVariantSchema,
    updateVariantSchema
} from "../validators/productValidator.ts";

export class ProductController {
    private productService: ProductService;

    constructor(productService: ProductService) {
        this.productService = productService;
    }

    // ───────────────── Product CRUD ─────────────────

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = createProductSchema.parse(req.body);
            const userId = (req as AuthRequest).auth.sub;
            const product = await this.productService.create(validatedData, userId);

            res.status(201).json({
                success: true,
                message: "Product created successfully",
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = productQuerySchema.parse(req.query);
            const result = await this.productService.findAll(query);

            res.status(200).json({
                success: true,
                message: "Products retrieved successfully",
                data: result.data,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: Math.ceil(result.total / result.limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const product = await this.productService.findById(req.params.id as string);

            res.status(200).json({
                success: true,
                message: "Product retrieved successfully",
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    async findByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = productQuerySchema.parse(req.query);
            const result = await this.productService.findByCategory(req.params.id as string, query);

            res.status(200).json({
                success: true,
                message: "Products retrieved successfully",
                data: result.data,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: Math.ceil(result.total / result.limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async findByBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = productQuerySchema.parse(req.query);
            const result = await this.productService.findByBrand(req.params.id as string, query);

            res.status(200).json({
                success: true,
                message: "Products retrieved successfully",
                data: result.data,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: Math.ceil(result.total / result.limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = updateProductSchema.parse(req.body);
            const userId = (req as AuthRequest).auth.sub;
            const product = await this.productService.update(req.params.id as string, validatedData, userId);

            res.status(200).json({
                success: true,
                message: "Product updated successfully",
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { status } = updateProductStatusSchema.parse(req.body);
            const product = await this.productService.updateStatus(req.params.id as string, status as ProductStatus);

            res.status(200).json({
                success: true,
                message: "Product status updated successfully",
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.productService.softDelete(req.params.id as string);

            res.status(200).json({
                success: true,
                message: "Product deleted successfully",
                data: null
            });
        } catch (error) {
            next(error);
        }
    }

    // ───────────────── Product Images ─────────────────

    async uploadImages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const files = req.files as Express.Multer.File[];
            if (!files || files.length === 0) {
                res.status(400).json({
                    success: false,
                    message: "No images uploaded",
                    errors: [{ field: "images", message: "At least one image is required" }]
                });
                return;
            }

            const images = await this.productService.addImages(req.params.id as string, files);

            res.status(201).json({
                success: true,
                message: "Images uploaded successfully",
                data: images
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.productService.deleteImage(req.params.id as string);

            res.status(200).json({
                success: true,
                message: "Image deleted successfully",
                data: null
            });
        } catch (error) {
            next(error);
        }
    }

    // ───────────────── Product Variants ─────────────────

    async addVariant(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = createVariantSchema.parse(req.body);
            const variant = await this.productService.addVariant(req.params.id as string, validatedData);

            res.status(201).json({
                success: true,
                message: "Variant added successfully",
                data: variant
            });
        } catch (error) {
            next(error);
        }
    }

    async updateVariant(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = updateVariantSchema.parse(req.body);
            const variant = await this.productService.updateVariant(req.params.id as string, validatedData);

            res.status(200).json({
                success: true,
                message: "Variant updated successfully",
                data: variant
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteVariant(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.productService.deleteVariant(req.params.id as string);

            res.status(200).json({
                success: true,
                message: "Variant deleted successfully",
                data: null
            });
        } catch (error) {
            next(error);
        }
    }
}
