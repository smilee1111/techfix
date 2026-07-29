import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createBookingDto, updateBookingStatusDto } from "../dtos/booking.dto";
import { UserRole } from "../../config/constants";

const router = Router();
const bookingController = new BookingController();

// Booking is a real commitment, so — unlike estimates — it requires login.
router.post("/", authenticate, validate(createBookingDto), bookingController.create);

// Registered before "/:id" so "mine"/"incoming" aren't swallowed as :id params.

// GET /api/bookings/mine — the logged-in customer's own bookings ("My Repairs")
router.get("/mine", authenticate, bookingController.getMine);

// GET /api/bookings/incoming — bookings against the logged-in seller's listings
router.get(
  "/incoming",
  authenticate,
  authorize(UserRole.SELLER, UserRole.ADMIN),
  bookingController.getIncoming
);

router.get("/:id", authenticate, bookingController.getById);

// PATCH /api/bookings/:id/status — seller (owner) or admin advances the stage
router.patch(
  "/:id/status",
  authenticate,
  authorize(UserRole.SELLER, UserRole.ADMIN),
  validate(updateBookingStatusDto),
  bookingController.updateStatus
);

// GET /api/bookings/:id/status — full stage history (customer, owning seller, or admin)
router.get("/:id/status", authenticate, bookingController.getStatusHistory);

export default router;
