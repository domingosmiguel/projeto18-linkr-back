import { Router } from 'express';
import {
  logOut,
  searchUsers,
  signIn,
  userSignUp,
  userTimeline,
} from '../controllers/users.controller.js';
import getTrendingHashtags from '../middlewares/getTrendingHashtags.middleware.js';
import jwtValidation from '../middlewares/auth.middleware.js';
import signInMiddleware from '../middlewares/signIn.middleware.js';
import validateUserSignUpSchema from '../middlewares/validateUserSignUpModel.middleware.js';

const router = Router();

router.post('/signup', validateUserSignUpSchema, userSignUp);

router.post('/signin', signInMiddleware, signIn);

router.post('/logout', jwtValidation, logOut);

router.get('/usernames', jwtValidation, searchUsers);

router.get('/user/:id', jwtValidation, getTrendingHashtags, userTimeline);

export default router;
