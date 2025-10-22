import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const router = Router();

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

// Serve media by storage key. Tries S3/MinIO first, falls back to local uploads folder.
router.get('/:key', async (req, res) => {
  const key = req.params.key;
  try {
    if (s3Client) {
      try {
        const bucket = process.env.S3_BUCKET || 'hagiga';
        const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
        const outAny: any = await s3Client.send(cmd as any);
        const stream = outAny.Body as any;
        const contentType = (outAny.ContentType as string) || 'application/octet-stream';
        res.setHeader('content-type', contentType);
        // pipe readable stream
        if (stream && typeof stream.pipe === 'function') {
          stream.pipe(res);
          return;
        }
        // Body might be an async iterable
        if (stream && Symbol.asyncIterator in stream) {
          const chunks: Buffer[] = [];
          for await (const chunk of stream) chunks.push(Buffer.from(chunk));
          res.send(Buffer.concat(chunks));
          return;
        }
      } catch (err) {
        console.error('s3 get failed for key', key, err);
        // fall through to local
      }
    }

    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    const filePath = path.join(uploadsDir, key);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    res.status(404).send('not found');
  } catch (err: any) {
    console.error('serve media error', err);
    res.status(500).send(String(err.message || err));
  }
});

export default router;
