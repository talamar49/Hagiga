import { Router } from 'express';
import { Invitation } from '../models';

const router = Router();

router.get('/:eventId', async (req, res) => {
  try {
    const items = await Invitation.find({ eventId: req.params.eventId }).sort({ createdAt: 1 }).populate('mediaId').lean();
    const normalized = items.map((it: any) => ({ ...it, media: it.mediaId || null }));
    res.json({ invitations: normalized });
  } catch (err: any) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

export default router;
