import { Router } from 'express';
import {
  deleteFollow,
  logOut,
  postNewFollow,
  searchUsers,
  seeIfFollow,
  signIn,
  userSignUp,
  userTimeline,
} from '../controllers/users.controller.js';
import jwtValidation from '../middlewares/auth.middleware.js';
import getTrendingHashtags from '../middlewares/getTrendingHashtags.middleware.js';
import signInMiddleware from '../middlewares/signIn.middleware.js';
import validateUserSignUpSchema from '../middlewares/validateUserSignUpModel.middleware.js';

const router = Router();

router.post('/signup', validateUserSignUpSchema, userSignUp);

router.post('/signin', signInMiddleware, signIn);

router.post('/logout', jwtValidation, logOut);

router.get('/usernames', jwtValidation, searchUsers);

router.get('/user/:id', jwtValidation, getTrendingHashtags, userTimeline);

router.get('/follows/:id', jwtValidation, seeIfFollow);

router.post('/follows/:id', jwtValidation, postNewFollow);

router.delete('/follows/:id', jwtValidation, deleteFollow);

export default router;
