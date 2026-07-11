import { Router } from "express";
import { AppDataSource } from "../config/data-source.ts";
import { Product } from "../entities/Product.ts";
import { ProductImage } from "../entities/ProductImage.ts";
import { ProductVariant } from "../entities/ProductVariant.ts";
import { Category } from "../entities/Category.ts";
import { Brand } from "../entities/Brand.ts";
import { ProductService } from "../services/ProductService.ts";
import { ProductController } from "../controllers/ProductController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { authorizeRoles } from "../middlewares/roleGuard.ts";
import { upload } from "../middlewares/uploadMiddleware.ts";

const router = Router();

// Dependency Injection
const productRepository = AppDataSource.getRepository(Product);
const imageRepository = AppDataSource.getRepository(ProductImage);
const variantRepository = AppDataSource.getRepository(ProductVariant);
const categoryRepository = AppDataSource.getRepository(Category);
const brandRepository = AppDataSource.getRepository(Brand);

const productService = new ProductService(
    productRepository,
    imageRepository,
    variantRepository,
    categoryRepository,
    brandRepository
);
const productController = new ProductController(productService);

// ───────────────── Public Routes (Customer) ─────────────────

router.get("/", (req, res, next) => productController.findAll(req, res, next));
router.get("/search", (req, res, next) => productController.findAll(req, res, next)); // search uses same handler with query params
router.get("/category/:id", (req, res, next) => productController.findByCategory(req, res, next));
router.get("/brand/:id", (req, res, next) => productController.findByBrand(req, res, next));
router.get("/:id", (req, res, next) => productController.findById(req, res, next));

// ───────────────── Admin Routes ─────────────────

router.post(
    "/",
    authMiddleware,
    authorizeRoles("admin"),
    (req, res, next) => productController.create(req, res, next)
);

router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("admin"),
    (req, res, next) => productController.update(req, res, next)
);

router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("admin"),
    (req, res, next) => productController.delete(req, res, next)
);

router.patch(
    "/:id/status",
    authMiddleware,
    authorizeRoles("admin"),
    (req, res, next) => productController.updateStatus(req, res, next)
);

// ───────────────── Image Routes (Admin) ─────────────────

router.post(
    "/:id/images",
    authMiddleware,
    authorizeRoles("admin"),
    upload.array("images", 10),
    (req, res, next) => productController.uploadImages(req, res, next)
);

router.delete(
    "/images/:id",
    authMiddleware,
    authorizeRoles("admin"),
    (req, res, next) => productController.deleteImage(req, res, next)
);

// ───────────────── Variant Routes (Admin) ─────────────────

router.post(
    "/:id/variants",
    authMiddleware,
    authorizeRoles("admin"),
    (req, res, next) => productController.addVariant(req, res, next)
);

router.put(
    "/variants/:id",
    authMiddleware,
    authorizeRoles("admin"),
    (req, res, next) => productController.updateVariant(req, res, next)
);

router.delete(
    "/variants/:id",
    authMiddleware,
    authorizeRoles("admin"),
    (req, res, next) => productController.deleteVariant(req, res, next)
);

export default router;
