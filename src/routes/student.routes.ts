import { Router } from "express";
import { authRequired, studentOnly } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { postLimiter, likeLimiter, commentLimiter, uploadLimiter } from "../middleware/rateLimiter";
import { updateProfileSchema } from "../utils/validators/profile.validators";
import {
  createPostSchema,
  postParamsSchema,
  commentSchema,
} from "../utils/validators/post.validators";
import { submitVerificationSchema } from "../utils/validators/verificationSubmission.validators";
import { clubParamsSchema } from "../utils/validators/club.validators";
import { eventParamsSchema } from "../utils/validators/event.validators";
import { rewardParamsSchema, couponParamsSchema } from "../utils/validators/reward.validators";
import {
  getProfileHandler,
  updateProfileHandler,
} from "../controllers/profile.controller";
import {
  createPostHandler,
  getFeedHandler,
  likePostHandler,
  unlikePostHandler,
  commentOnPostHandler,
  getPostCommentsHandler,
} from "../controllers/post.controller";
import {
  submitVerificationHandler,
  getVerificationStatusHandler,
} from "../controllers/verificationSubmission.controller";
import { uploadVerificationImages, uploadPostImage, uploadProfileImages } from "../middleware/upload.middleware";
import {
  getClubsHandler,
  getClubByIdHandler,
  joinClubHandler,
  leaveClubHandler,
} from "../controllers/studentClub.controller";
import {
  getEventsHandler,
  getEventByIdHandler,
  rsvpEventHandler,
  cancelRSVPHandler,
} from "../controllers/studentEvent.controller";
import {
  getRewardsHandler,
  getRewardByIdHandler,
  redeemRewardHandler,
  getCouponsHandler,
  getCouponByIdHandler,
  redeemCouponHandler,
} from "../controllers/reward.controller";

const router = Router();

// All student routes require authentication and student role
router.use(authRequired, studentOnly);

// Profile
router.get("/profile", getProfileHandler);
router.put("/profile", uploadLimiter, uploadProfileImages, validate(updateProfileSchema), updateProfileHandler);

// Posts
router.post("/posts", postLimiter, uploadPostImage, validate(createPostSchema), createPostHandler);
router.get("/posts/feed", getFeedHandler);
router.post("/posts/:id/like", likeLimiter, validate(postParamsSchema), likePostHandler);
router.delete("/posts/:id/like", validate(postParamsSchema), unlikePostHandler);
router.post("/posts/:id/comments", commentLimiter, validate(commentSchema), commentOnPostHandler);
router.get("/posts/:id/comments", validate(postParamsSchema), getPostCommentsHandler);

// Verification
router.post("/verification", uploadLimiter, uploadVerificationImages, submitVerificationHandler);
router.get("/verification/status", getVerificationStatusHandler);

// Clubs
router.get("/clubs", getClubsHandler);
router.get("/clubs/:id", validate(clubParamsSchema), getClubByIdHandler);
router.post("/clubs/:id/join", validate(clubParamsSchema), joinClubHandler);
router.delete("/clubs/:id/leave", validate(clubParamsSchema), leaveClubHandler);

// Events
router.get("/events", getEventsHandler);
router.get("/events/:id", validate(eventParamsSchema), getEventByIdHandler);
router.post("/events/:id/rsvp", validate(eventParamsSchema), rsvpEventHandler);
router.delete("/events/:id/rsvp", validate(eventParamsSchema), cancelRSVPHandler);

// Rewards & Coupons
router.get("/rewards", getRewardsHandler);
router.get("/rewards/:id", validate(rewardParamsSchema), getRewardByIdHandler);
router.post("/rewards/:id/redeem", validate(rewardParamsSchema), redeemRewardHandler);
router.get("/coupons", getCouponsHandler);
router.get("/coupons/:id", validate(couponParamsSchema), getCouponByIdHandler);
router.post("/coupons/:id/redeem", validate(couponParamsSchema), redeemCouponHandler);

export default router;

