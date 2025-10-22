import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { Guest } from '../models';
import { Participant } from '../models';
import requireAuth from '../middleware/auth';


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

router.post('/:id/guests', requireAuth, async (req, res) => {
  const eventId = req.params.id;
  const user = (req as any).user || { _id: null };
  const uploadedBy = user._id;
  const guests = req.body;
  const toInsert: any[] = [];

  if (!Array.isArray(guests)) return res.status(400).json({ error: 'expected array of guests' });
  if (hasDuplicatePhoneNumbers(guests)) return res.status(400).json({ error: 'duplicate phone numbers in request' });

  for (const guest of guests) {
    const { name, lastName } = guest;
    // normalize phone/participants fields (accept multiple variants)
    const phone = (guest.phone || guest.phoneNumber || guest.phone_number || '').toString();
    const participantsCount = Number(guest.numAttendees ?? guest.participantsCount ?? guest.participants_count ?? guest.num ?? 1) || 1;
    if (!guest || !name || String(name).trim() === '') return res.status(400).json({ error: 'name required for each guest' });
    if ((!phone || String(phone).trim() === '')) return res.status(400).json({ error: 'at least one phone number required for each group of guests' });
    const doc = { name, lastName, phoneNumber: phone, participantsCount, eventId, uploadedBy };
    toInsert.push(doc);
  }

  try {
    const inserted = await Guest.insertMany(toInsert);
    // Also create corresponding Participant documents for the event so the participants listing shows them
    try {
  const partDocs = inserted.map((g: any) => ({ eventId: g.eventId, name: g.name, lastName: g.lastName, phone: g.phoneNumber || g.phone || '', numAttendees: g.participantsCount || g.numAttendees || 1, importMeta: { fromGuest: true } }));
      const insertedParts = await Participant.insertMany(partDocs);
      console.log('mirrored guests to participants', insertedParts.length);
      res.json({ insertedCount: inserted.length, mirrored: insertedParts.length });
    } catch (e: any) {
      console.error('failed to mirror guests to participants', e?.message || e);
      // still return guest insert result
      res.json({ insertedCount: inserted.length, mirrored: 0, mirrorError: String(e?.message || e) });
    }
  } catch (err: any) {
    console.error('guest insert error', err);
    res.status(500).json({ error: String(err.message) });
  }
});

export default router;