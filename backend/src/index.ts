import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import db from './lib/db';
import './models';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// serve uploaded files from /uploads
import path from 'path';
import fs from 'fs';
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

const MONGO = process.env.MONGO_URL || 'mongodb://localhost:27017/hagiga';

db.connect(MONGO).then(() => {
  console.log('connected to mongo');
}).catch(err => console.error('mongo connect error', err));

app.get('/health', (req, res) => res.json({ ok: true }));
import routes from './routes';

app.use('/api/v1', routes);

// If S3 is configured, ensure the bucket exists (helpful for local MinIO dev)
import { S3Client, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

async function ensureBucket() {
  const endpoint = process.env.S3_ENDPOINT;
  const bucket = process.env.S3_BUCKET;
  if (!endpoint || !bucket) return;
  const client = new S3Client({ endpoint, region: process.env.S3_REGION || 'us-east-1', credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID || '', secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '' }, forcePathStyle: !!process.env.S3_FORCE_PATH_STYLE });
  // Retry a few times in case MinIO is still starting
  for (let i = 0; i < 8; i++) {
    try {
      // check bucket
      await client.send(new HeadBucketCommand({ Bucket: bucket } as any));
      console.log('S3 bucket exists:', bucket);
      return;
    } catch (err) {
      try {
        await client.send(new CreateBucketCommand({ Bucket: bucket } as any));
        console.log('Created S3 bucket:', bucket);
        return;
      } catch (e) {
        console.log('Waiting for S3 to be ready...', i, String(e));
      }
    }
    await new Promise(r => setTimeout(r, 1500));
  }
  console.warn('Could not ensure S3 bucket exists, uploads may fall back to local storage');
}

ensureBucket().then(() => {
  app.listen(process.env.PORT || 4000, () => {
    console.log('listening on', process.env.PORT || 4000);
  });
}).catch(err => {
  console.error('bucket check failed', err);
  app.listen(process.env.PORT || 4000, () => {
    console.log('listening on', process.env.PORT || 4000);
  });
});
