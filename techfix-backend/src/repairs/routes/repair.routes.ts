import { Router } from "express";
import { RepairController } from "../controllers/repair.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  searchRepairsDto,
  compareRepairsDto,
  createRepairServiceDto,
  updateRepairServiceDto,
  setRepairServiceActiveDto,
  setRepairServiceVerifiedDto,
} from "../dtos/repair.dto";
import { UserRole } from "../../config/constants";

const router = Router();
const repairController = new RepairController();

// ─── Public routes ────────────────────────────────────────────────

// GET /api/repairs?q=&category=&minPrice=&maxPrice=&minRating=&lat=&lng=...
router.get("/", validate(searchRepairsDto, "query"), repairController.search);

// GET /api/repairs/compare?ids=id1,id2,id3
// Registered before "/:id" so "compare" isn't swallowed as an :id param.
router.get("/compare", validate(compareRepairsDto, "query"), repairController.compare);

// ─── Seller-only routes ────────────────────────────────────────────
// Registered before "/:id" so "mine" isn't swallowed as an :id param.

// GET /api/repairs/mine — the logged-in seller's own listings
router.get(
  "/mine",
  authenticate,
  authorize(UserRole.SELLER, UserRole.ADMIN),
  repairController.getMine
);

router.post(
  "/",
  authenticate,
  authorize(UserRole.SELLER, UserRole.ADMIN),
  validate(createRepairServiceDto),
  repairController.create
);

// PATCH /api/repairs/:id — owning seller (or admin) edits a listing
router.patch(
  "/:id",
  authenticate,
  authorize(UserRole.SELLER, UserRole.ADMIN),
  validate(updateRepairServiceDto),
  repairController.update
);

// PATCH /api/repairs/:id/active — soft delete / restore. Listings are never
// hard-deleted, so bookings referencing them keep resolving.
router.patch(
  "/:id/active",
  authenticate,
  authorize(UserRole.SELLER, UserRole.ADMIN),
  validate(setRepairServiceActiveDto),
  repairController.setActive
);

// PATCH /api/repairs/:id/verify — admin only; sellers cannot verify themselves
router.patch(
  "/:id/verify",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(setRepairServiceVerifiedDto),
  repairController.setVerified
);

// GET /api/repairs/:id
router.get("/:id", repairController.getById);

export default router;
