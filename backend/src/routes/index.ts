import { Router } from 'express';
import auth from './auth';
import debug from './debug';
import users from './users';
import imports from './imports';

const router = Router();

router.use('/auth', auth);
router.use('/debug', debug);
router.use('/users', users);
router.use('/events', imports);

export default router;
