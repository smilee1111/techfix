import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  searchProductsDto,
  compareProductsDto,
  createProductDto,
  updateProductDto,
  setProductActiveDto,
  setProductVerifiedDto,
} from "../dtos/product.dto";
import { UserRole } from "../../config/constants";

const router = Router();
const productController = new ProductController();

// ─── Public routes ────────────────────────────────────────────────

// GET /api/products?q=&category=&brand=&condition=&minPrice=...
router.get("/", validate(searchProductsDto, "query"), productController.search);

// Registered before "/:id" so these aren't swallowed as :id params.
router.get("/compare", validate(compareProductsDto, "query"), productController.compare);
router.get("/brands", productController.listBrands);

// ─── Seller-only routes ────────────────────────────────────────────

// GET /api/products/mine — the logged-in seller's own products
router.get(
  "/mine",
  authenticate,
  authorize(UserRole.SELLER, UserRole.ADMIN),
  productController.getMine
);

router.post(
  "/",
  authenticate,
  authorize(UserRole.SELLER, UserRole.ADMIN),
  validate(createProductDto),
  productController.create
);

router.patch(
  "/:id",
  authenticate,
  authorize(UserRole.SELLER, UserRole.ADMIN),
  validate(updateProductDto),
  productController.update
);

// Soft delete / restore — past orders keep resolving their product ref.
router.patch(
  "/:id/active",
  authenticate,
  authorize(UserRole.SELLER, UserRole.ADMIN),
  validate(setProductActiveDto),
  productController.setActive
);

// ─── Admin-only routes ─────────────────────────────────────────────

// Authenticity badge — sellers cannot verify themselves.
router.patch(
  "/:id/verify",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(setProductVerifiedDto),
  productController.setVerified
);

// GET /api/products/:id
router.get("/:id", productController.getById);

export default router;
