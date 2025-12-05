import { Router } from "express";
import { authRequired, studentOnly } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import {
  createOrderSchema,
  verifyPaymentSchema,
  giftCoinsSchema,
} from "../utils/validators/coin.validators";
import {
  getCoinBundlesHandler,
  createOrderHandler,
  verifyPaymentHandler,
  giftCoinsHandler,
  getTransactionHistoryHandler,
} from "../controllers/coin.controller";

const router = Router();

// All coin routes require authentication and student role
router.use(authRequired, studentOnly);

// GET /coins/bundles - Get all coin bundles
router.get("/bundles", getCoinBundlesHandler);

// POST /coins/create-order - Create a payment order
router.post("/create-order", validate(createOrderSchema), createOrderHandler);

// POST /coins/verify - Verify payment
router.post("/verify", validate(verifyPaymentSchema), verifyPaymentHandler);

// POST /coins/gift - Gift coins to another user
router.post("/gift", validate(giftCoinsSchema), giftCoinsHandler);

// GET /coins/history - Get transaction history
router.get("/history", getTransactionHistoryHandler);

export default router;

