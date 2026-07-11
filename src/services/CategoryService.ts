import type { Repository } from "typeorm";
import { Category } from "../entities/Category.ts";
import createHttpError from "http-errors";
import type { CreateCategoryInput, UpdateCategoryInput } from "../validators/productValidator.ts";

export class CategoryService {
    private categoryRepository: Repository<Category>;

    constructor(categoryRepository: Repository<Category>) {
        this.categoryRepository = categoryRepository;
    }

    async create(input: CreateCategoryInput): Promise<Category> {
        // Check slug uniqueness
        const existing = await this.categoryRepository.findOne({ where: { slug: input.slug } });
        if (existing) {
            throw new createHttpError.Conflict(`Category with slug '${input.slug}' already exists`);
        }

        // Validate parent category if provided
        if (input.parentId) {
            const parent = await this.categoryRepository.findOne({ where: { id: input.parentId } });
            if (!parent) {
                throw new createHttpError.NotFound("Parent category not found");
            }
        }

        const category = new Category();
        category.name = input.name;
        category.slug = input.slug;
        category.isActive = input.isActive ?? true;
        if (input.icon !== undefined) category.icon = input.icon;
        if (input.image !== undefined) category.image = input.image;
        if (input.parentId !== undefined && input.parentId !== null) category.parentId = input.parentId;

        return await this.categoryRepository.save(category);
    }

    async findAll(): Promise<Category[]> {
        return await this.categoryRepository.find({
            where: { isActive: true },
            relations: { children: true },
            order: { name: "ASC" }
        });
    }

    async findById(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: { children: true, parent: true }
        });
        if (!category) {
            throw new createHttpError.NotFound("Category not found");
        }
        return category;
    }

    async update(id: string, input: UpdateCategoryInput): Promise<Category> {
        const category = await this.findById(id);

        if (input.slug && input.slug !== category.slug) {
            const existing = await this.categoryRepository.findOne({ where: { slug: input.slug } });
            if (existing) {
                throw new createHttpError.Conflict(`Category with slug '${input.slug}' already exists`);
            }
        }

        if (input.parentId) {
            const parent = await this.categoryRepository.findOne({ where: { id: input.parentId } });
            if (!parent) {
                throw new createHttpError.NotFound("Parent category not found");
            }
        }

        Object.assign(category, input);
        return await this.categoryRepository.save(category);
    }

    async delete(id: string): Promise<void> {
        const category = await this.findById(id);
        await this.categoryRepository.remove(category);
    }
}
