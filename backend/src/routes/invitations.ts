import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Invitation, Media } from '../models';
import requireAuth from '../middleware/auth';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const router = Router();
const upload = multer({ dest: path.join(os.tmpdir(), 'uploads') });

const s3Endpoint = process.env.S3_ENDPOINT;
let s3Client: S3Client | null = null;
if (s3Endpoint) {
  s3Client = new S3Client({
    endpoint: s3Endpoint,
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: !!process.env.S3_FORCE_PATH_STYLE,
  });
}

// List invitations for an event (oldest -> newest)
router.get('/:id/invitations', requireAuth, async (req, res) => {
  const eventId = req.params.id;
  try {
    const items = await Invitation.find({ eventId }).sort({ createdAt: 1 }).populate({ path: 'mediaId' }).lean();
    // normalize media under 'media'
    const normalized = items.map((it: any) => ({ ...it, media: it.mediaId || null }));
    res.json({ invitations: normalized });
  } catch (err: any) {
    console.error('list invitations error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// Create invitation - accepts multipart/form-data with optional file or mediaId
router.post('/:id/invitations', requireAuth, upload.single('file'), async (req, res) => {
  const eventId = req.params.id;
  const user = (req as any).user || { _id: null };
  try {
    const { text, mediaId } = req.body as any;
    let finalMediaId = mediaId;

    if (req.file) {
      // create a Media document (upload to S3 if available, otherwise local)
      const ext = path.extname(req.file.originalname) || '';
      const id = uuidv4();
      const filename = `${id}${ext}`;
      const type = req.file.mimetype && req.file.mimetype.startsWith('video/') ? 'video' : 'image';

      if (s3Client) {
        const bucket = process.env.S3_BUCKET || 'hagiga';
        const fileStream = fs.createReadStream(req.file.path);
        const uploadParams = { Bucket: bucket, Key: filename, Body: fileStream, ContentType: req.file.mimetype };
        try {
          const parallelUploads3 = new Upload({ client: s3Client, params: uploadParams });
          await parallelUploads3.done();
          try { fs.unlinkSync(req.file.path); } catch (e) {}
          const url = `${process.env.S3_ENDPOINT?.replace(/\/$/, '')}/${bucket}/${filename}`;
          const media = await Media.create({ eventId, uploaderId: user._id, storageKey: filename, url, type, caption: req.body.caption || '' });
          finalMediaId = media._id;
        } catch (e) {
          console.error('s3 upload failed', e);
        }
      }

      if (!finalMediaId) {
        const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const destPath = path.join(uploadsDir, filename);
        fs.renameSync(req.file.path, destPath);
        const url = `/uploads/${filename}`;
        const media = await Media.create({ eventId, uploaderId: user._id, storageKey: filename, url, type, caption: req.body.caption || '' });
        finalMediaId = media._id;
      }
    }

    const doc = await Invitation.create({ eventId, creatorId: user._id, mediaId: finalMediaId, text });
    const populated = await Invitation.findById(doc._id).populate('mediaId').lean();
    res.status(201).json({ invitation: populated });
  } catch (err: any) {
    console.error('create invitation error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// Get single invitation
router.get('/:id/invitations/:invId', requireAuth, async (req, res) => {
  const { id: eventId, invId } = req.params;
  try {
    const doc = await Invitation.findOne({ _id: invId, eventId }).populate('mediaId');
    if (!doc) return res.status(404).json({ error: 'invitation not found' });
    res.json({ invitation: doc });
  } catch (err: any) {
    console.error('get invitation error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// Update invitation
router.patch('/:id/invitations/:invId', requireAuth, upload.single('file'), async (req, res) => {
  const { id: eventId, invId } = req.params;
  try {
    const { text, mediaId } = req.body as any;
    const update: any = {};
    if (text !== undefined) update.text = text;
    if (mediaId) update.mediaId = mediaId;
    if (req.file) {
      // same logic as create to produce a media and set mediaId
      const ext = path.extname(req.file.originalname) || '';
      const id = uuidv4();
      const filename = `${id}${ext}`;
      const type = req.file.mimetype && req.file.mimetype.startsWith('video/') ? 'video' : 'image';

      if (s3Client) {
        const bucket = process.env.S3_BUCKET || 'hagiga';
        const fileStream = fs.createReadStream(req.file.path);
        const uploadParams = { Bucket: bucket, Key: filename, Body: fileStream, ContentType: req.file.mimetype };
        try {
          const parallelUploads3 = new Upload({ client: s3Client, params: uploadParams });
          await parallelUploads3.done();
          try { fs.unlinkSync(req.file.path); } catch (e) {}
          const url = `${process.env.S3_ENDPOINT?.replace(/\/$/, '')}/${bucket}/${filename}`;
          const media = await Media.create({ eventId, uploaderId: (req as any).user?._id, storageKey: filename, url, type, caption: req.body.caption || '' });
          update.mediaId = media._id;
        } catch (e) {
          console.error('s3 upload failed', e);
        }
      }

      if (!update.mediaId) {
        const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const destPath = path.join(uploadsDir, filename);
        fs.renameSync(req.file.path, destPath);
        const url = `/uploads/${filename}`;
        const media = await Media.create({ eventId, uploaderId: (req as any).user?._id, storageKey: filename, url, type, caption: req.body.caption || '' });
        update.mediaId = media._id;
      }
    }

    if (Object.keys(update).length === 0) return res.status(400).json({ error: 'nothing to update' });
    const updated = await Invitation.findOneAndUpdate({ _id: invId, eventId }, { $set: update }, { new: true }).populate('mediaId');
    if (!updated) return res.status(404).json({ error: 'invitation not found' });
    res.json({ invitation: updated });
  } catch (err: any) {
    console.error('update invitation error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// Delete invitation
router.delete('/:id/invitations/:invId', requireAuth, async (req, res) => {
  const { id: eventId, invId } = req.params;
  try {
    const removed = await Invitation.findOneAndDelete({ _id: invId, eventId });
    if (!removed) return res.status(404).json({ error: 'invitation not found' });
    res.status(204).send();
  } catch (err: any) {
    console.error('delete invitation error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

export default router;
