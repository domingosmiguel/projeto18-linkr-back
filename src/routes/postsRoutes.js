import { Router } from 'express';
import {
  postTimelinePosts,
  getTimelinePosts,
  getHashtagPosts,
  deletePost,
  updatePost
} from '../controllers/postControllers.js';
import jwtValidation from '../middlewares/auth.middleware.js';
import getTrendingHashtags from '../middlewares/getTrendingHashtags.middleware.js';
import getUserInfo from '../middlewares/getUserInfo.middleware.js';
import { postMiddleware } from '../middlewares/postMiddleware.js';

const router = Router();

router.post(
  '/timeline-posts',
  jwtValidation,
  postMiddleware,
  postTimelinePosts
);

router.get(
  '/timeline-posts',
  jwtValidation,
  getUserInfo,
  getTrendingHashtags,
  getTimelinePosts
);

router.get(
  '/hashtag/:hashtag',
  jwtValidation,
  getUserInfo,
  getTrendingHashtags,
  getHashtagPosts
);

router.delete(
  "/user-posts/:id", 
  jwtValidation, 
  deletePost
  );

router.patch(
  "/post-edition/:id",
  jwtValidation,
  updatePost
)

export default router;
