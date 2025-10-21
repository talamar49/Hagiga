import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
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

// Create an event
// POST /api/v1/events (router is mounted at /events)
router.post('/', /* requireAuth, */ async (req, res) => {
  try {
    const data = req.body || {};
    // minimal validation
    const eventOwners = Array.isArray(data.eventOwners) && data.eventOwners.length > 0 ? data.eventOwners : null;
    const title = data.title ? String(data.title).trim() : null;
    const type = data.type ? String(data.type).trim() : null;
    if (!eventOwners || !title || !type) return res.status(400).json({ error: 'eventOwners (array), title and type are required' });

    const ev = await Event.create({
      eventOwners,
      title,
      type,
      date: data.date ? new Date(data.date) : undefined,
      venue: data.venue,
      description: data.description,
      settings: data.settings || {},
    });

    res.status(201).json({ eventId: ev._id });
  } catch (err: any) {
    console.error('create event error', err);
    res.status(500).json({ error: String(err.message) });
  }
});



const hasDuplicatePhoneNumbers = (guests: any[]) => {
  const phoneNumbers = new Set<string>();
  for (const guest of guests) {
    const phoneNumber = (guest && (guest.phoneNumber || guest['phone number'] || guest.phone || '')).toString();
    if (!phoneNumber) continue;
    if (phoneNumbers.has(phoneNumber)) return true;
    phoneNumbers.add(phoneNumber);
  }
  return false;
};

router.post('/:id/guests', /* requireAuth, */ async (req, res) => {
  const eventId = req.params.id;
  const user = (req as any).user || { _id: null };
  const uploadedBy = user._id;
  const guests = req.body;
  const toInsert: any[] = [];

  if (!Array.isArray(guests)) return res.status(400).json({ error: 'expected array of guests' });
  if (hasDuplicatePhoneNumbers(guests)) return res.status(400).json({ error: 'duplicate phone numbers in request' });

  const requirePhone = guests.length > 1;

  for (const guest of guests) {
    // normalize fields coming from the frontend (support several key formats)
    const name = (guest?.name || guest?.firstName || guest?.firstname || '').toString().trim();
    const lastName = (guest?.lastName || guest?.lastname || guest?.['last name'] || '').toString().trim();
    const phoneNumber = (guest?.phoneNumber || guest?.['phone number'] || guest?.phone || '').toString().trim();
    const participantsCount = Number(guest?.participantsCount ?? guest?.['num of participants'] ?? guest?.num ?? 1) || 1;

    if (!name) return res.status(400).json({ error: 'name required for each guest' });
    if (requirePhone && !phoneNumber) return res.status(400).json({ error: 'phone number required when multiple guests' });

    const doc = { name, lastName, phoneNumber, participantsCount, eventId, uploadedBy };
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