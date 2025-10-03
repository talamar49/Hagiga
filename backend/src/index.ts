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

const MONGO = process.env.MONGO_URL || 'mongodb://localhost:27017/hagiga';

db.connect(MONGO).then(() => {
  console.log('connected to mongo');
}).catch(err => console.error('mongo connect error', err));

app.get('/health', (req, res) => res.json({ ok: true }));
import routes from './routes';

app.use('/api/v1', routes);

app.listen(process.env.PORT || 4000, () => {
  console.log('listening on', process.env.PORT || 4000);
});
