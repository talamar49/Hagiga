import dotenv from 'dotenv';
dotenv.config();

import db from '../src/lib/db';
import {
  User,
  Event,
  Participant,
  Table,
  Media,
  Comment,
  Message,
  Supplier,
  Review,
  Group,
  ImportJob,
} from '../src/models';

async function seed() {
  const MONGO = process.env.MONGO_URL || 'mongodb://localhost:27017/hagiga';
  await db.connect(MONGO);
  console.log('connected to mongo for seeding');

  const summary: Record<string, any> = {};

  // User
  let user = await User.findOne({ phone: '+10000000001' });
  if (!user) user = await User.create({ phone: '+10000000001', roles: ['host'], firstName: 'Alice', lastName: 'Host' });
  summary.user = user._id;

  // Event
  let event = await Event.findOne({ title: 'Sample Event' });
  if (!event) event = await Event.create({ hostId: user._id, title: 'Sample Event', type: 'wedding', date: new Date() });
  summary.event = event._id;

  // Participant
  let participant = await Participant.findOne({ eventId: event._id, phone: '+10000000002' });
  if (!participant) participant = await Participant.create({ eventId: event._id, name: 'John', lastName: 'Doe', phone: '+10000000002', numAttendees: 2 });
  summary.participant = participant._id;

  // Table
  let table = await Table.findOne({ eventId: event._id, name: 'Table 1' });
  if (!table) table = await Table.create({ eventId: event._id, name: 'Table 1', type: 'round', capacity: 8, seats: [{ seatId: 's1', occupantParticipantId: participant._id }] });
  summary.table = table._id;

  // Media
  let media = await Media.findOne({ eventId: event._id });
  if (!media) media = await Media.create({ eventId: event._id, uploaderId: user._id, storageKey: 'sample.jpg', url: 'https://example.com/sample.jpg', type: 'image', caption: 'Sample photo' });
  summary.media = media._id;

  // Comment
  let comment = await Comment.findOne({ mediaId: media._id });
  if (!comment) comment = await Comment.create({ mediaId: media._id, authorId: participant._id, text: 'Looking forward to it!' });
  summary.comment = comment._id;

  // Message
  let message = await Message.findOne({ eventId: event._id, channel: 'sms' });
  if (!message) message = await Message.create({ eventId: event._id, fromRole: 'host', to: ['+10000000002'], channel: 'sms', body: 'Welcome to the event' });
  summary.message = message._id;

  // Supplier
  let supplier = await Supplier.findOne({ businessName: 'Acme Photos' });
  if (!supplier) supplier = await Supplier.create({ ownerId: user._id, businessName: 'Acme Photos', phone: '+10000000003', shortDesc: 'Photographers' });
  summary.supplier = supplier._id;

  // Review
  let review = await Review.findOne({ supplierId: supplier._id, reviewerId: participant._id });
  if (!review) review = await Review.create({ supplierId: supplier._id, eventId: event._id, reviewerId: participant._id, reviewerRole: 'participant', rating: 9, title: 'Great' });
  summary.review = review._id;

  // Group
  let group = await Group.findOne({ eventId: event._id, name: 'Ridealong' });
  if (!group) group = await Group.create({ eventId: event._id, name: 'Ridealong', members: [participant._id], createdBy: user._id });
  summary.group = group._id;

  // ImportJob
  let job = await ImportJob.findOne({ eventId: event._id, fileKey: 'sample.csv' });
  if (!job) job = await ImportJob.create({ eventId: event._id, uploadedBy: user._id, fileKey: 'sample.csv', status: 'done', totalRows: 1, successCount: 1 });
  summary.importJob = job._id;

  console.log('seeding complete:', summary);
  process.exit(0);
}

seed().catch(err => { console.error('seed error', err); process.exit(1); });
