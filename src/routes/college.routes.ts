import { Router } from "express";
import { authRequired, collegeAdminOnly } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import {
  createEventSchema,
  eventParamsSchema,
} from "../utils/validators/event.validators";
import {
  createClubSchema,
  clubParamsSchema,
} from "../utils/validators/club.validators";
import {
  approveRejectVerificationSchema,
  verificationParamsSchema,
} from "../utils/validators/verification.validators";
import {
  getStudentsHandler,
  getStudentStatsHandler,
} from "../controllers/student.controller";
import {
  getPendingVerificationsHandler,
  approveRejectVerificationHandler,
  bypassVerificationHandler,
} from "../controllers/verification.controller";
import {
  createEventHandler,
  getEventsHandler,
  getEventByIdHandler,
} from "../controllers/event.controller";
import {
  createClubHandler,
  getClubsHandler,
  getClubByIdHandler,
} from "../controllers/club.controller";
import {
  createAnnouncementHandler,
  getAnnouncementsHandler,
} from "../controllers/announcement.controller";
import { getAnalyticsHandler } from "../controllers/collegeAnalytics.controller";
import { uploadEventImage } from "../middleware/upload.middleware";
import { uploadLimiter } from "../middleware/rateLimiter";

const router = Router();

// All college admin routes require authentication and college admin role
router.use(authRequired, collegeAdminOnly);

// Students Management
router.get("/students", getStudentsHandler);
router.get("/students/stats", getStudentStatsHandler);

// Verification Workflow
router.get("/verifications/pending", getPendingVerificationsHandler);
router.put(
  "/verifications/:id",
  validate(approveRejectVerificationSchema),
  approveRejectVerificationHandler
);
router.post("/verification/bypass", bypassVerificationHandler);

// Events
router.post("/events", uploadLimiter, uploadEventImage, validate(createEventSchema), createEventHandler);
router.get("/events", getEventsHandler);
router.get("/events/:id", validate(eventParamsSchema), getEventByIdHandler);

// Clubs
router.post("/clubs", validate(createClubSchema), createClubHandler);
router.get("/clubs", getClubsHandler);
router.get("/clubs/:id", validate(clubParamsSchema), getClubByIdHandler);

// Announcements
router.post("/announcements", createAnnouncementHandler);
router.get("/announcements", getAnnouncementsHandler);

// Analytics
router.get("/analytics", getAnalyticsHandler);

export default router;

