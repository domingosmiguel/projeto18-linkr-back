import { Router } from 'express';
import {
  deletePost,
  getHashtagPosts,
<<<<<<< HEAD
  deletePost,
  updatePost
=======
  getTimelinePosts,
  postLikes,
  postTimelinePosts,
>>>>>>> main
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

<<<<<<< HEAD
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
=======
router.delete('/user-posts/:id', jwtValidation, deletePost);

router.get('/:postId/likes', jwtValidation, postLikes);
>>>>>>> main

export default router;
