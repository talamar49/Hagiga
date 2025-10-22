import { Router } from 'express';
import { Event } from '../models';
import requireAuth from '../middleware/auth';

const router = Router();

// Get all events for the authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'unauthorized' });
    
    // Find events where user is an owner
    const events = await Event.find({ eventOwners: user._id }).sort({ createdAt: -1 });
    
    res.json({ events });
  } catch (err: any) {
    console.error('list events error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// Create a new event
router.post('/', requireAuth, async (req, res) => {
  const { title, type, date, description } = req.body || {};
  if (!title || !type) return res.status(400).json({ error: 'title and type required' });

  const user = (req as any).user;
  const ownerId = user ? user._id : undefined;
  const eventData: any = { title, type, description, eventOwners: ownerId ? [ownerId] : [] };
  if (date) eventData.date = new Date(date);

  try {
    const ev = await Event.create(eventData);
    res.status(201).json({ id: ev._id, event: ev });
  } catch (err: any) {
    console.error('create event error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// Delete event (only owners)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const user = (req as any).user;
    const ev = await Event.findById(eventId);
    if (!ev) return res.status(404).json({ error: 'event not found' });
    if (!user || !ev.eventOwners || !ev.eventOwners.map((o: any) => String(o)).includes(String(user._id))) {
      return res.status(403).json({ error: 'not event owner' });
    }
    await Event.findByIdAndDelete(eventId);
    // cleanup participants and import jobs for this event
    try {
      const { Participant, ImportJob } = await import('../models');
      // remove participants
      await Participant.deleteMany({ eventId });
      // find import jobs to remove files
      const jobs = await ImportJob.find({ eventId });
      for (const j of jobs) {
        try {
          if (j.fileKey) {
            // attempt to unlink; ignore errors
            try { require('fs').unlinkSync(String(j.fileKey)); } catch (e) {}
          }
        } catch (e) {}
      }
      await ImportJob.deleteMany({ eventId });
    } catch (e) {
      console.warn('cleanup after delete event failed', e);
    }
    return res.status(204).send();
  } catch (err: any) {
    console.error('delete event error', err);
    return res.status(500).json({ error: String(err.message || err) });
  }
});

// Update event (only owners)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const user = (req as any).user;
    const ev = await Event.findById(eventId);
    if (!ev) return res.status(404).json({ error: 'event not found' });
    if (!user || !ev.eventOwners || !ev.eventOwners.map((o: any) => String(o)).includes(String(user._id))) {
      return res.status(403).json({ error: 'not event owner' });
    }
    const { title, type, date, description } = req.body || {};
    const update: any = {};
    if (title !== undefined) update.title = title;
    if (type !== undefined) update.type = type;
    if (description !== undefined) update.description = description;
    if (date !== undefined) update.date = date ? new Date(date) : null;

    const updated = await Event.findByIdAndUpdate(eventId, { $set: update }, { new: true });
    res.json({ event: updated });
  } catch (err: any) {
    console.error('update event error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

export default router;
