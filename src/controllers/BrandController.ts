import type { Request, Response, NextFunction } from "express";
import { BrandService } from "../services/BrandService.ts";
import { createBrandSchema, updateBrandSchema } from "../validators/productValidator.ts";

export class BrandController {
    private brandService: BrandService;

    constructor(brandService: BrandService) {
        this.brandService = brandService;
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = createBrandSchema.parse(req.body);
            const brand = await this.brandService.create(validatedData);

            res.status(201).json({
                success: true,
                message: "Brand created successfully",
                data: brand
            });
        } catch (error) {
            next(error);
        }
    }

    async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const brands = await this.brandService.findAll();

            res.status(200).json({
                success: true,
                message: "Brands retrieved successfully",
                data: brands
            });
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const brand = await this.brandService.findById(req.params.id as string);

            res.status(200).json({
                success: true,
                message: "Brand retrieved successfully",
                data: brand
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = updateBrandSchema.parse(req.body);
            const brand = await this.brandService.update(req.params.id as string, validatedData);

            res.status(200).json({
                success: true,
                message: "Brand updated successfully",
                data: brand
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.brandService.delete(req.params.id as string);

            res.status(200).json({
                success: true,
                message: "Brand deleted successfully",
                data: null
            });
        } catch (error) {
            next(error);
        }
    }
}
