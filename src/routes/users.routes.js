import { Router } from 'express';
import { userSignUp } from '../controllers/users.controller.js';

const router = Router();

router.post('/signup', userSignUp);

router.post('/signin');

export default router;
