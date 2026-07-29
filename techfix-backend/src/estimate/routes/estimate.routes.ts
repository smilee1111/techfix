import { Router } from "express";
import { EstimateController } from "../controllers/estimate.controller";
import { validate } from "../../middlewares/validate.middleware";
import { createEstimateDto } from "../dtos/estimate.dto";

const router = Router();
const estimateController = new EstimateController();

// Public — getting a price estimate is a frictionless discovery tool and
// deliberately doesn't require login, matching public repair browsing.

// POST /api/estimates
router.post("/", validate(createEstimateDto), estimateController.create);

// GET /api/estimates/:id
router.get("/:id", estimateController.getById);

export default router;
