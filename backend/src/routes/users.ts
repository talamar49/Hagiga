import { Router } from 'express';
// requireAuth temporarily disabled for development. Uncomment to re-enable.
// import requireAuth from '../middleware/auth';

const router = Router();

router.get('/me', /* requireAuth, */ (req, res) => {
  const user = (req as any).user || { id: null };
  res.json({ user });
});

export default router;
