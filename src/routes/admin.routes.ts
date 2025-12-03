import { Router } from "express";
import { authRequired, superAdminOnly } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import {
  createCollegeSchema,
  updateCollegeSchema,
  collegeParamsSchema,
} from "../utils/validators/college.validators";
import {
  createCollegeAdminSchema,
  deleteUserSchema,
  deletePostSchema,
} from "../utils/validators/admin.validators";
import {
  createCollegeHandler,
  getAllCollegesHandler,
  getCollegeByIdHandler,
  updateCollegeHandler,
  deleteCollegeHandler,
} from "../controllers/college.controller";
import {
  createCollegeAdminHandler,
  deleteUserHandler,
  deletePostHandler,
  getAnalyticsHandler,
} from "../controllers/admin.controller";

const router = Router();

// All admin routes require authentication and super admin role
router.use(authRequired, superAdminOnly);

// College Management
router.post("/colleges", validate(createCollegeSchema), createCollegeHandler);
router.get("/colleges", getAllCollegesHandler);
router.get("/colleges/:id", validate(collegeParamsSchema), getCollegeByIdHandler);
router.put("/colleges/:id", validate(updateCollegeSchema), updateCollegeHandler);
router.delete("/colleges/:id", validate(collegeParamsSchema), deleteCollegeHandler);

// College Admin Creation
router.post("/college-admins", validate(createCollegeAdminSchema), createCollegeAdminHandler);

// Delete Operations
router.delete("/users/:id", validate(deleteUserSchema), deleteUserHandler);
router.delete("/posts/:id", validate(deletePostSchema), deletePostHandler);

// Analytics
router.get("/analytics", getAnalyticsHandler);

export default router;

