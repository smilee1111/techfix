import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createCategoryDto, updateCategoryDto, listCategoriesDto } from "../dtos/category.dto";
import { UserRole } from "../../config/constants";

const router = Router();
const categoryController = new CategoryController();

// ─── Public routes ────────────────────────────────────────────────

// GET /api/categories?type=repair|product
router.get("/", validate(listCategoriesDto, "query"), categoryController.list);

// GET /api/categories/:slug
router.get("/:slug", categoryController.getBySlug);

// ─── Admin-only routes ────────────────────────────────────────────

router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createCategoryDto),
  categoryController.create
);

router.put(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateCategoryDto),
  categoryController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  categoryController.remove
);

export default router;
