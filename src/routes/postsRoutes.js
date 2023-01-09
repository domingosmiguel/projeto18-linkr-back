import { Router } from 'express';
// import jwtValidation from "../middlewares/auth.middleware.js"
import {
  deletePost,
  dislikePost,
  getHashtagPosts,
  getTimelinePosts,
  likePost,
  postLikes,
  postTimelinePosts,
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

router.delete('/user-posts/:id', jwtValidation, deletePost);

router.get('/:postId/likes', jwtValidation, postLikes);

router.post('/:postId/userLike', jwtValidation, likePost);
router.delete('/:postId/userLike', jwtValidation, dislikePost);

export default router;
