import { Router } from 'express';
import {
  deletePost,
  dislikePost,
  getHashtagPosts,
  updatePost,
  getTimelinePosts,
  likePost,
  postLikes,
  postTimelinePosts,
  getNewPosts,
  publishComment,
  getAllComments,
  getComments,
  loadMorePosts,
} from '../controllers/postControllers.js';
import jwtValidation from '../middlewares/auth.middleware.js';
import getTrendingHashtags from '../middlewares/getTrendingHashtags.middleware.js';
import getUserInfo from '../middlewares/getUserInfo.middleware.js';
import { postMiddleware } from '../middlewares/postMiddleware.js';
import { commentMiddleware } from '../middlewares/commentMiddleware.js';

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

router.get('/timeline-posts/:id', jwtValidation, loadMorePosts);

router.get(
  '/hashtag/:hashtag',
  jwtValidation,
  getUserInfo,
  getTrendingHashtags,
  getHashtagPosts
);

router.delete('/user-posts/:id', jwtValidation, deletePost);

router.patch('/post-edition/:id', jwtValidation, updatePost);

router.get('/:postId/likes', jwtValidation, postLikes);

router.post('/:postId/userLike', jwtValidation, likePost);

router.delete('/:postId/userLike', jwtValidation, dislikePost);

router.get('/new-posts/:id', jwtValidation, getNewPosts);

router.post(
  '/post-comment/:id',
  jwtValidation,
  commentMiddleware,
  publishComment
);

router.get('/post-comments-all/:id', jwtValidation, getAllComments);

router.get('/post-comment/:id', jwtValidation, getComments);

export default router;
