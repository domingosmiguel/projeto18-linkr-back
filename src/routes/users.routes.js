import { Router } from 'express';
import { signIn, userSignUp } from '../controllers/users.controller.js';
import signInMiddleware from '../middlewares/signIn.middleware.js';
import validateUserSignUpSchema from '../middlewares/validateUserSignUpModel.middleware.js';

const router = Router();

router.post('/signup', validateUserSignUpSchema, userSignUp);

router.post('/signin', signInMiddleware, signIn);

export default router;
