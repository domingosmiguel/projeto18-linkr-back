import { Router } from 'express';
import { signIn, userSignUp } from '../controllers/users.controller.js';
import signInMiddleware from '../middlewares/signIn.middleware.js';

const router = Router();

router.post('/signup', userSignUp);

router.post('/signin', signInMiddleware, signIn);

export default router;
