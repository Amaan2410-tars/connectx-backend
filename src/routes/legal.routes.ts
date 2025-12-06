import { Router } from "express";
import {
  getTermsAndConditions,
  getPrivacyPolicy,
  getShippingPolicy,
  getContactUs,
  getCancellationAndRefunds,
} from "../controllers/legal.controller";

const router = Router();

// All legal pages are public (no authentication required)

// GET /legal/terms - Terms and Conditions
router.get("/terms", getTermsAndConditions);

// GET /legal/privacy - Privacy Policy
router.get("/privacy", getPrivacyPolicy);

// GET /legal/shipping - Shipping Policy
router.get("/shipping", getShippingPolicy);

// GET /legal/contact - Contact Us
router.get("/contact", getContactUs);

// GET /legal/refunds - Cancellation and Refunds Policy
router.get("/refunds", getCancellationAndRefunds);

export default router;


