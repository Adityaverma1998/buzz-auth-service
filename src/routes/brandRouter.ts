import { Router } from "express";
import { AppDataSource } from "../config/data-source.ts";
import { Brand } from "../entities/Brand.ts";
import { BrandService } from "../services/BrandService.ts";
import { BrandController } from "../controllers/BrandController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { authorizeRoles } from "../middlewares/roleGuard.ts";

const router = Router();

// Dependency Injection
const brandRepository = AppDataSource.getRepository(Brand);
const brandService = new BrandService(brandRepository);
const brandController = new BrandController(brandService);

// Public routes
router.get("/", (req, res, next) => brandController.findAll(req, res, next));
router.get("/:id", (req, res, next) => brandController.findById(req, res, next));

// Admin-only routes
router.post("/", authMiddleware, authorizeRoles("admin"), (req, res, next) => brandController.create(req, res, next));
router.put("/:id", authMiddleware, authorizeRoles("admin"), (req, res, next) => brandController.update(req, res, next));
router.delete("/:id", authMiddleware, authorizeRoles("admin"), (req, res, next) => brandController.delete(req, res, next));

export default router;
