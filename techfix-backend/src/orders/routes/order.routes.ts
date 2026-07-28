import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createOrderDto, updateOrderStatusDto } from "../dtos/order.dto";
import { UserRole } from "../../config/constants";

const router = Router();
const orderController = new OrderController();

// Placing an order is a real commitment, so it requires login.
router.post("/", authenticate, validate(createOrderDto), orderController.create);

// Registered before "/:id" so "mine" isn't swallowed as an :id param.
router.get("/mine", authenticate, orderController.getMine);

router.get("/:id", authenticate, orderController.getById);

// GET /api/orders/:id/status — full fulfilment history (customer or admin)
router.get("/:id/status", authenticate, orderController.getStatusHistory);

// PATCH /api/orders/:id/status — seller or admin advances the stage
router.patch(
  "/:id/status",
  authenticate,
  authorize(UserRole.SELLER, UserRole.ADMIN),
  validate(updateOrderStatusDto),
  orderController.updateStatus
);

export default router;
