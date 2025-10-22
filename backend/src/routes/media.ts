import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Media } from '../models';
import requireAuth from '../middleware/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

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

const router = Router();
const upload = multer({ dest: path.join(os.tmpdir(), 'uploads') });

// Upload media for an event and store in backend/uploads with uuid filename
router.post('/:id/media', requireAuth, upload.single('file'), async (req, res) => {
  const eventId = req.params.id;
  const user = (req as any).user || { _id: null };
  try {
    if (!req.file) return res.status(400).json({ error: 'file required' });
    const ext = path.extname(req.file.originalname) || '';
    const id = uuidv4();
    const filename = `${id}${ext}`;
    const type = req.file.mimetype && req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    if (s3Client) {
      // upload to S3 / MinIO
      const bucket = process.env.S3_BUCKET || 'hagiga';
      const fileStream = fs.createReadStream(req.file.path);
      const uploadParams = { Bucket: bucket, Key: filename, Body: fileStream, ContentType: req.file.mimetype };
      try {
        const parallelUploads3 = new Upload({ client: s3Client, params: uploadParams });
        await parallelUploads3.done();
        // remove temp file
        try { fs.unlinkSync(req.file.path); } catch (e) {}
        const url = `${process.env.S3_ENDPOINT?.replace(/\/$/, '')}/${bucket}/${filename}`;
        const media = await Media.create({ eventId, uploaderId: user._id, storageKey: filename, url, type, caption: req.body.caption || '' });
        res.status(201).json({ media });
        return;
      } catch (err: any) {
        console.error('s3 upload failed', err);
        // fall through to local storage
      }
    }

    // fallback: local uploads
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const destPath = path.join(uploadsDir, filename);
    fs.renameSync(req.file.path, destPath);
    const url = `/uploads/${filename}`; // served statically from express
    const media = await Media.create({ eventId, uploaderId: user._id, storageKey: filename, url, type, caption: req.body.caption || '' });
    res.status(201).json({ media });
  } catch (err: any) {
    console.error('media upload error', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

export default router;
