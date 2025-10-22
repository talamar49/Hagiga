import { Router } from 'express';
import mongoose from 'mongoose';
import { Guest, Participant } from '../models';

const router = Router();

router.get('/models', (req, res) => {
  const models = Object.keys(mongoose.models);
  res.json({ models });
});

router.get('/data/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const guests = await Guest.find({ eventId }).lean();
    const parts = await Participant.find({ eventId }).lean();
    res.json({ guests, participants: parts });
  } catch (err: any) {
    res.status(500).json({ error: String(err?.message || err) });
  }
});

export default router;
