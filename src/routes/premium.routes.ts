import { Router } from "express";
import { authRequired, studentOnly } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { subscribeToPremiumSchema } from "../utils/validators/premium.validators";
import {
  subscribeToPremiumHandler,
  getPremiumStatusHandler,
  cancelPremiumHandler,
} from "../controllers/premium.controller";

const router = Router();

// All premium routes require authentication and student role
router.use(authRequired, studentOnly);

// POST /premium/subscribe - Subscribe to premium
router.post("/subscribe", validate(subscribeToPremiumSchema), subscribeToPremiumHandler);

// GET /premium/status - Get premium status
router.get("/status", getPremiumStatusHandler);

// POST /premium/cancel - Cancel premium subscription
router.post("/cancel", cancelPremiumHandler);

export default router;

