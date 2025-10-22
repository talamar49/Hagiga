import { Router } from 'express';
import auth from './auth';
import debug from './debug';
import debugInvites from './debugInvites';
import users from './users';
import imports from './imports';
import events from './events';
import guests from './guest';
import invitations from './invitations';
import media from './media';
import serveMedia from './serveMedia';

const router = Router();

router.use('/auth', auth);
router.use('/debug', debug);
router.use('/debug/invitations', debugInvites);
router.use('/users', users);
// Mount both routers - more specific routes (imports) should be registered first
// but Express will match the most specific route regardless of order when both are mounted
router.use('/events', events);
router.use('/events', imports);
router.use('/events', guests);
router.use('/events', invitations);
router.use('/events', media);
router.use('/media', serveMedia);

export default router;
