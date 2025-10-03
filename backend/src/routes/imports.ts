import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { ImportJob, Event, Guest } from '../models';
import csvImport from '../services/csvImport';
// requireAuth middleware temporarily disabled for development. To re-enable, uncomment the import above.
// import requireAuth from '../middleware/auth';

const router = Router();
const upload = multer({ dest: path.join(os.tmpdir(), 'uploads') });

// POST /api/v1/events/:id/participants/import
// NOTE: auth removed for now - to re-enable add requireAuth as the second argument here.
router.post('/:id/participants/import', /* requireAuth, */ upload.single('file'), async (req, res) => {
  const eventId = req.params.id;
  const user = (req as any).user || { _id: null };
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: 'file required' });

  // verify event exists and user is host (simple check)
  const ev = await Event.findById(eventId);
  if (!ev) return res.status(404).json({ error: 'event not found' });
  // When auth is disabled, user._id may be null — skip host check in that case.
  if (user._id && ev.hostId.toString() !== user._id.toString()) return res.status(403).json({ error: 'not event host' });

  const importJob = await ImportJob.create({ eventId, uploadedBy: user._id, fileKey: file.path, status: 'processing' });

  // process in background
  (async () => {
    try {
      await csvImport.processCsv(file.path, eventId, user._id, importJob._id);
    } catch (err) {
      console.error('import error', err);
    }
  })();

  res.status(202).json({ importJobId: importJob._id });
});

// GET import status
// NOTE: auth removed for now - to re-enable add requireAuth as the second argument here.
router.get('/:id/imports/:jobId', /* requireAuth, */ async (req, res) => {
  const job = await ImportJob.findById(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'not found' });
  res.json({ job });
});

// POST /api/v1/events/:id/guests
// Accepts an array of guest objects in the body and inserts them into the guests collection.
// Save guests into the guests collection (on-demand)
// NOTE: auth removed for now - to re-enable add requireAuth as the second argument here.
router.post('/:id/guests', /* requireAuth, */ async (req, res) => {
  const eventId = req.params.id;
  const user = (req as any).user || { _id: null };
  const data = req.body;
  if (!Array.isArray(data)) return res.status(400).json({ error: 'expected array of guests' });

  // Validation rules:
  // - name is required
  // - if more than one guest in the array, phone number is required per guest
  const requirePhone = data.length > 1;
  const toInsert: any[] = [];
  for (const g of data) {
    if (!g || !g.name || String(g.name).trim() === '') return res.status(400).json({ error: 'name required for each guest' });
    if (requirePhone && (!g['phone number'] || String(g['phone number']).trim() === '')) return res.status(400).json({ error: 'phone number required when multiple guests' });
    const doc = { ...g, eventId, uploadedBy: user._id };
    toInsert.push(doc);
  }

  try {
    const inserted = await Guest.insertMany(toInsert);
    res.json({ insertedCount: inserted.length });
  } catch (err: any) {
    console.error('guest insert error', err);
    res.status(500).json({ error: String(err.message) });
  }
});

export default router;
