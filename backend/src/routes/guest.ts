import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { Guest } from '../models';
// requireAuth middleware temporarily disabled for development. To re-enable, uncomment the import above.
// import requireAuth from '../middleware/auth';


const router = Router();
const upload = multer({ dest: path.join(os.tmpdir(), 'uploads') });

const hasDuplicatePhoneNumbers = (guests: any[]) => {
    const phoneNumbers = new Set<string>();
    for (const guest of guests) {
        const phoneNumber = guest.phoneNumber;
        if (phoneNumbers.has(phoneNumber)) {
            return true;
        }
    }
    return false;
}

router.post(':id/guests', /* requireAuth, */ async (req, res) => {
  const eventId = req.params.id;
  const user = (req as any).user || { _id: null };
  const uploadedBy = user._id;
  const guests = req.body;
  const toInsert: any[] = [];

  !Array.isArray(guests) ? res.status(400).json({ error: 'expected array of guests' }): null;
  hasDuplicatePhoneNumbers(guests) ? res.status(400).json({ error: 'duplicate phone numbers in request' }) : null;

  for (const guest of guests) {
    const {name,lastName, phoneNumber, participantsCount} = guest;
    if (!guest || !name || String(name).trim() === '') return res.status(400).json({ error: 'name required for each guest' });
    if ((!phoneNumber || String(phoneNumber).trim() === '')) return res.status(400).json({ error: 'at least one phone number required for each group of guests' });
    const doc = { name, lastName, phoneNumber, participantsCount, eventId, uploadedBy}; 
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