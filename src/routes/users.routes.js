import { Router } from 'express';

const router = Router();

router.post('/signup', userSignUp);

router.post('/signin');

export default router;
