import assert from 'assert';
import { normalizeRow } from '../src/services/csvImport';

function run() {
  // 1. name column
  const r1 = normalizeRow({ Name: 'Alice Smith', Phone: '123' });
  assert.strictEqual(r1.name, 'Alice Smith');
  assert.strictEqual(r1.phone, '123');

  // 2. first/last fallback
  const r2 = normalizeRow({ 'First Name': 'Bob', LASTNAME: 'Jones', phone_number: '555' });
  assert.strictEqual(r2.name, 'Bob Jones');
  assert.strictEqual(r2.phone, '555');

  // 3. missing phone
  const r3 = normalizeRow({ name: 'No Phone' });
  assert.strictEqual(r3.name, 'No Phone');
  assert.strictEqual(r3.phone, '');

  // 4. num attendees parsing
  const r4 = normalizeRow({ name: 'Group', num_of_participants: '3', phone: '9' });
  assert.strictEqual(r4.numAttendees, 3);

  console.log('csv normalize tests passed');
}

run();
