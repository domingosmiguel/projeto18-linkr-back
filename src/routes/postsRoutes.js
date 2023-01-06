import { Router } from 'express';
// import jwtValidation from "../middlewares/auth.middleware.js"
import {
  postTimelinePosts,
  getTimelinePosts,
} from '../controllers/postControllers.js';
import jwtValidation from '../middlewares/auth.middleware.js';
import getUserInfo from '../middlewares/getUserInfo.middleware.js';
import { postMiddleware } from '../middlewares/postMiddleware.js';

const router = Router();

router.post('/timeline-posts', postMiddleware, postTimelinePosts);

router.get('/timeline-posts', jwtValidation, getUserInfo, getTimelinePosts);

export default router;
