import { Router } from 'express';

import { isAuth } from '@/middleware/auth.middleware.ts';
import { validate } from '@/middleware/validate.middleware.ts';

import authCtrl from './auth.controller.ts';
import { loginSchema, registerSchema } from './auth.schema.ts';

const router = Router();

router.post('/register', validate(registerSchema), authCtrl.registerHandler);
router.post('/login', validate(loginSchema), authCtrl.loginHandler);
router.get('/me', isAuth, authCtrl.meHandler);
router.post('/refresh', authCtrl.refreshHandler);
router.post('/logout', authCtrl.logoutHandler);
router.get('/google/start', authCtrl.googleStart);
router.get('/google/callback', authCtrl.googleCallback);

export default router;
