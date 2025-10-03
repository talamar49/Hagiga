import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/models', (req, res) => {
  const models = Object.keys(mongoose.models);
  res.json({ models });
});

export default router;
