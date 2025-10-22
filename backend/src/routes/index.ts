import { Router } from 'express';
import auth from './auth';
import debug from './debug';
import users from './users';
import imports from './imports';
import events from './events';
import guests from './guest';

const router = Router();

router.use('/auth', auth);
router.use('/debug', debug);
router.use('/users', users);
// Mount both routers - more specific routes (imports) should be registered first
// but Express will match the most specific route regardless of order when both are mounted
router.use('/events', events);
router.use('/events', imports);
router.use('/events', guests);

export default router;
