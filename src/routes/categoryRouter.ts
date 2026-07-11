import { Router } from "express";
import { AppDataSource } from "../config/data-source.ts";
import { Category } from "../entities/Category.ts";
import { CategoryService } from "../services/CategoryService.ts";
import { CategoryController } from "../controllers/CategoryController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { authorizeRoles } from "../middlewares/roleGuard.ts";

const router = Router();

// Dependency Injection
const categoryRepository = AppDataSource.getRepository(Category);
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

// Public routes (any user can view categories)
router.get("/", (req, res, next) => categoryController.findAll(req, res, next));
router.get("/:id", (req, res, next) => categoryController.findById(req, res, next));

// Admin-only routes
router.post("/", authMiddleware, authorizeRoles("admin"), (req, res, next) => categoryController.create(req, res, next));
router.put("/:id", authMiddleware, authorizeRoles("admin"), (req, res, next) => categoryController.update(req, res, next));
router.delete("/:id", authMiddleware, authorizeRoles("admin"), (req, res, next) => categoryController.delete(req, res, next));

export default router;
