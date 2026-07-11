import type { Repository } from "typeorm";
import { Brand } from "../entities/Brand.ts";
import createHttpError from "http-errors";
import type { CreateBrandInput, UpdateBrandInput } from "../validators/productValidator.ts";

export class BrandService {
    private brandRepository: Repository<Brand>;

    constructor(brandRepository: Repository<Brand>) {
        this.brandRepository = brandRepository;
    }

    async create(input: CreateBrandInput): Promise<Brand> {
        const brand = new Brand();
        brand.name = input.name;
        brand.isActive = input.isActive ?? true;
        if (input.logo !== undefined) brand.logo = input.logo;
        if (input.description !== undefined) brand.description = input.description;

        return await this.brandRepository.save(brand);
    }

    async findAll(): Promise<Brand[]> {
        return await this.brandRepository.find({
            where: { isActive: true },
            order: { name: "ASC" }
        });
    }

    async findById(id: string): Promise<Brand> {
        const brand = await this.brandRepository.findOne({ where: { id } });
        if (!brand) {
            throw new createHttpError.NotFound("Brand not found");
        }
        return brand;
    }

    async update(id: string, input: UpdateBrandInput): Promise<Brand> {
        const brand = await this.findById(id);
        Object.assign(brand, input);
        return await this.brandRepository.save(brand);
    }

    async delete(id: string): Promise<void> {
        const brand = await this.findById(id);
        await this.brandRepository.remove(brand);
    }
}
