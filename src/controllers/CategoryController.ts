import type { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/CategoryService.ts";
import { createCategorySchema, updateCategorySchema } from "../validators/productValidator.ts";

export class CategoryController {
    private categoryService: CategoryService;

    constructor(categoryService: CategoryService) {
        this.categoryService = categoryService;
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = createCategorySchema.parse(req.body);
            const category = await this.categoryService.create(validatedData);

            res.status(201).json({
                success: true,
                message: "Category created successfully",
                data: category
            });
        } catch (error) {
            next(error);
        }
    }

    async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const categories = await this.categoryService.findAll();

            res.status(200).json({
                success: true,
                message: "Categories retrieved successfully",
                data: categories
            });
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const category = await this.categoryService.findById(req.params.id as string);

            res.status(200).json({
                success: true,
                message: "Category retrieved successfully",
                data: category
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = updateCategorySchema.parse(req.body);
            const category = await this.categoryService.update(req.params.id as string, validatedData);

            res.status(200).json({
                success: true,
                message: "Category updated successfully",
                data: category
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.categoryService.delete(req.params.id as string);

            res.status(200).json({
                success: true,
                message: "Category deleted successfully",
                data: null
            });
        } catch (error) {
            next(error);
        }
    }
}
