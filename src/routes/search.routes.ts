import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { searchSchema } from "../utils/validators/search.validators";
import { searchHandler } from "../controllers/search.controller";

const router = Router();

// All search routes require authentication
router.use(authRequired);

// Search endpoint
router.get("/", validate(searchSchema), searchHandler);

export default router;

