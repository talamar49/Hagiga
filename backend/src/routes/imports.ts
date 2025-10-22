import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { ImportJob, Event, Participant } from '../models';
import csvImport from '../services/csvImport';
import requireAuth from '../middleware/auth';

const router = Router();
const upload = multer({ dest: path.join(os.tmpdir(), 'uploads') });

// POST /api/v1/events/:id/participants/import
router.post('/:id/participants/import', requireAuth, upload.single('file'), async (req, res) => {
  const eventId = req.params.id;
  const user = (req as any).user;
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: 'file required' });

  // verify event exists and user is host (simple check)
  const ev = await Event.findById(eventId);
  if (!ev) return res.status(404).json({ error: 'event not found' });
  // verify user is in eventOwners
  if (!user || !ev.eventOwners || !ev.eventOwners.map((o: any) => String(o)).includes(String(user._id))) return res.status(403).json({ error: 'not event owner' });

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
router.get('/:id/imports/:jobId', /* requireAuth, */ async (req, res) => {
  const job = await ImportJob.findById(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'not found' });
  res.json({ job });
});

// GET list of import jobs for an event
router.get('/:id/imports', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const user = (req as any).user;
    const ev = await Event.findById(eventId);
    if (!ev) return res.status(404).json({ error: 'event not found' });
    if (!user || !ev.eventOwners || !ev.eventOwners.map((o: any) => String(o)).includes(String(user._id))) return res.status(403).json({ error: 'not event owner' });

    const jobs = await ImportJob.find({ eventId }).sort({ createdAt: -1 }).limit(50);
    res.json({ jobs });
  } catch (err: any) {
    console.error('list import jobs error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// GET errors CSV for a job
router.get('/:id/imports/:jobId/errors', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const jobId = req.params.jobId;
    const user = (req as any).user;
    const ev = await Event.findById(eventId);
    if (!ev) return res.status(404).json({ error: 'event not found' });
    if (!user || !ev.eventOwners || !ev.eventOwners.map((o: any) => String(o)).includes(String(user._id))) return res.status(403).json({ error: 'not event owner' });

    const job = await ImportJob.findById(jobId);
    if (!job) return res.status(404).json({ error: 'job not found' });

    const rows = job.errorRows || [];
    // If no structured rows, fall back to errorLog
    if (!rows.length) {
      return res.status(404).json({ error: 'no error rows available' });
    }

    // Build CSV: include rowIndex, reason, and flattened row columns
    const headersSet = new Set<string>();
    rows.forEach((r: any) => {
      if (r.row && typeof r.row === 'object') {
        Object.keys(r.row).forEach(k => headersSet.add(k));
      }
    });
    const headers = ['rowIndex', 'reason', ...Array.from(headersSet)];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="import_${jobId}_errors.csv"`);

    // write header
    res.write(headers.join(',') + '\n');
    for (const r of rows) {
      const cells: string[] = [];
      cells.push(String(r.rowIndex || ''));
      cells.push(String((r.reason || '').replace(/"/g, '""')));
      const rowObj = r.row || {};
      for (const h of Array.from(headersSet)) {
        const val = rowObj[h] !== undefined && rowObj[h] !== null ? String(rowObj[h]) : '';
        // escape quotes and wrap in quotes if contains comma
        const safe = val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val.replace(/"/g, '""')}"` : val;
        cells.push(safe);
      }
      res.write(cells.join(',') + '\n');
    }
    res.end();
  } catch (err: any) {
    console.error('errors csv error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// POST retry failed rows for a job - owner only
router.post('/:id/imports/:jobId/retry', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const jobId = req.params.jobId;
    const user = (req as any).user;
    const ev = await Event.findById(eventId);
    if (!ev) return res.status(404).json({ error: 'event not found' });
    if (!user || !ev.eventOwners || !ev.eventOwners.map((o: any) => String(o)).includes(String(user._id))) return res.status(403).json({ error: 'not event owner' });

    const job = await ImportJob.findById(jobId);
    if (!job) return res.status(404).json({ error: 'job not found' });
    if (!job.errorRows || !Array.isArray(job.errorRows) || job.errorRows.length === 0) return res.status(400).json({ error: 'no failed rows to retry' });

    // create a new ImportJob to track the retry
    const newJob = await ImportJob.create({ eventId, uploadedBy: user._id, fileKey: `retry_of_${jobId}`, status: 'processing' });

    // process the in-memory rows
    (async () => {
      try {
        const rows = (job.errorRows || []).map((r: any) => r.row || {});
        await (await import('../services/csvImport')).processRows(rows, eventId, user._id, newJob._id);
      } catch (err) {
        console.error('retry processing failed', err);
      }
    })();

    res.status(202).json({ importJobId: newJob._id });
  } catch (err: any) {
    console.error('retry endpoint error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// GET participants for an event
router.get('/:id/participants', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const user = (req as any).user;
    
    // verify event exists and user is host
    const ev = await Event.findById(eventId);
    if (!ev) return res.status(404).json({ error: 'event not found' });
    if (!user || !ev.eventOwners || !ev.eventOwners.map((o: any) => String(o)).includes(String(user._id))) {
      return res.status(403).json({ error: 'not event owner' });
    }
    
  // Get participants for this event
  const parts = await Participant.find({ eventId }).sort({ createdAt: -1 });
    
  res.json({ participants: parts });
  } catch (err: any) {
    console.error('get participants error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// PATCH update a participant
router.patch('/:id/participants/:pid', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const pid = req.params.pid;
    const user = (req as any).user;
    const ev = await Event.findById(eventId);
    if (!ev) return res.status(404).json({ error: 'event not found' });
    if (!user || !ev.eventOwners || !ev.eventOwners.map((o: any) => String(o)).includes(String(user._id))) return res.status(403).json({ error: 'not event owner' });

    const allowed: any = {};
    const { name, lastName, phone, numAttendees, status } = req.body;
    if (name !== undefined) allowed.name = name;
    if (lastName !== undefined) allowed.lastName = lastName;
    if (phone !== undefined) allowed.phone = phone;
    if (numAttendees !== undefined) allowed.numAttendees = numAttendees;
    if (status !== undefined) allowed.status = status;

    const doc = await Participant.findOneAndUpdate({ _id: pid, eventId }, { $set: allowed }, { new: true });
    if (!doc) return res.status(404).json({ error: 'participant not found' });
    res.json({ participant: doc });
  } catch (err: any) {
    console.error('update participant error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// DELETE a participant
router.delete('/:id/participants/:pid', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const pid = req.params.pid;
    const user = (req as any).user;
    const ev = await Event.findById(eventId);
    if (!ev) return res.status(404).json({ error: 'event not found' });
    if (!user || !ev.eventOwners || !ev.eventOwners.map((o: any) => String(o)).includes(String(user._id))) return res.status(403).json({ error: 'not event owner' });

    const doc = await Participant.findOneAndDelete({ _id: pid, eventId });
    if (!doc) return res.status(404).json({ error: 'participant not found' });
    res.status(204).send();
  } catch (err: any) {
    console.error('delete participant error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// GET event by ID - must be LAST to not intercept more specific routes
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'event not found' });
    
    const user = (req as any).user;
    // Check if user is owner
    if (!user || !event.eventOwners || !event.eventOwners.map((o: any) => String(o)).includes(String(user._id))) {
      return res.status(403).json({ error: 'not authorized' });
    }
    
    res.json({ event });
  } catch (err: any) {
    console.error('get event error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});


export default router;
