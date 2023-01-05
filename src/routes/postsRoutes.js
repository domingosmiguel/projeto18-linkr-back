import { Router } from "express";
// import jwtValidation from "../middlewares/auth.middleware.js"
import { postTimelinePosts, getTimelinePosts } from "../controllers/postControllers.js";
import { postMiddleware } from "../middlewares/postMiddleware.js";

const router = Router();

router.post("/timeline-posts", postMiddleware, postTimelinePosts);

router.get("/timeline-posts", getTimelinePosts);

export default router;