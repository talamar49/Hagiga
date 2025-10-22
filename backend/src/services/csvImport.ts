import fs from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import { ImportJob, Participant } from '../models';

export function normalizeRow(row: Record<string, any>) {
  const normalized: Record<string, any> = {};
  for (const key of Object.keys(row)) {
    const k = String(key).trim().toLowerCase().replace(/\s+/g, '_');
    normalized[k] = row[key];
  }

  const firstName = normalized['first_name'] || normalized['first'] || normalized['firstname'] || '';
  const lastName = normalized['lastname'] || normalized['last_name'] || normalized['surname'] || '';
  const name = (normalized['name'] || normalized['full_name'] || '').trim() || ((firstName || lastName) ? `${firstName} ${lastName}`.trim() : '');
  const numAttendees = parseInt(String(normalized['num_of_participants'] || normalized['num_participants'] || normalized['num'] || '1'), 10) || 1;
  const phone = String(normalized['phone_number'] || normalized['phone'] || '').trim();

  return { normalized, firstName, lastName, name: String(name || '').trim(), numAttendees, phone };
}

export async function processCsv(filePath: string, eventId: any, uploadedBy: any, importJobId: any) {
  return new Promise<void>((resolve, reject) => {
    // normalize headers: trim, lowercase, replace spaces with underscores
    const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true, relax_column_count: true }));
    let total = 0;
    const errors: string[] = [];
    const tasks: Promise<void>[] = [];

    let rowIndex = 0;
    const structuredErrors: Array<{ rowIndex: number; reason: string; row: Record<string, any> }> = [];
    parser.on('data', (row: any) => {
      rowIndex += 1;
      total += 1;
      const task = (async () => {
        try {
          const { name, lastName, numAttendees, phone, normalized } = normalizeRow(row) as any;

          if (!name) {
            const reason = 'missing name';
            errors.push(`row ${rowIndex}: ${reason}`);
            structuredErrors.push({ rowIndex, reason, row: normalized });
            return;
          }
          if (!phone) {
            const reason = 'missing phone number';
            errors.push(`row ${rowIndex}: ${reason}`);
            structuredErrors.push({ rowIndex, reason, row: normalized });
            return;
          }

          await Participant.create({ eventId, name: String(name).trim(), lastName: String(lastName || '').trim(), phone, numAttendees });
        } catch (err: any) {
          const reason = err?.message || String(err);
          errors.push(`row ${rowIndex}: ${reason}`);
          structuredErrors.push({ rowIndex, reason, row });
        }
      })();
      tasks.push(task);
    });

    parser.on('end', async () => {
      try {
        await Promise.all(tasks);
  const success = total - errors.length;
  const failure = errors.length;
  await ImportJob.findByIdAndUpdate(importJobId, { status: 'done', totalRows: total, successCount: success, failureCount: failure, errorLog: errors, errorRows: structuredErrors });
        try { fs.unlinkSync(filePath); } catch (e) {}
        resolve();
      } catch (err: any) {
        await ImportJob.findByIdAndUpdate(importJobId, { status: 'failed', errorLog: [String(err.message || err)], errorRows: structuredErrors });
        reject(err);
      }
    });

    parser.on('error', async (err: any) => {
      await ImportJob.findByIdAndUpdate(importJobId, { status: 'failed', errorLog: [String(err.message || err)] });
      reject(err);
    });
  });
}

export default { processCsv, normalizeRow };

export async function processRows(rows: Array<Record<string, any>>, eventId: any, uploadedBy: any, importJobId: any) {
  // Similar logic to processCsv but operates on in-memory rows (already parsed)
  return new Promise<void>(async (resolve, reject) => {
    let total = 0;
    const errors: string[] = [];
    const structuredErrors: Array<{ rowIndex: number; reason: string; row: Record<string, any> }> = [];
    const tasks: Promise<void>[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rowIndex = i + 1;
      total += 1;
      const row = rows[i];
      const task = (async () => {
        try {
          const { name, lastName, numAttendees, phone, normalized } = normalizeRow(row) as any;
          if (!name) {
            const reason = 'missing name';
            errors.push(`row ${rowIndex}: ${reason}`);
            structuredErrors.push({ rowIndex, reason, row: normalized });
            return;
          }
          if (!phone) {
            const reason = 'missing phone number';
            errors.push(`row ${rowIndex}: ${reason}`);
            structuredErrors.push({ rowIndex, reason, row: normalized });
            return;
          }
          await Participant.create({ eventId, name: String(name).trim(), lastName: String(lastName || '').trim(), phone, numAttendees });
        } catch (err: any) {
          const reason = err?.message || String(err);
          errors.push(`row ${rowIndex}: ${reason}`);
          structuredErrors.push({ rowIndex, reason, row });
        }
      })();
      tasks.push(task);
    }

    try {
      await Promise.all(tasks);
      const success = total - errors.length;
      const failure = errors.length;
      await ImportJob.findByIdAndUpdate(importJobId, { status: 'done', totalRows: total, successCount: success, failureCount: failure, errorLog: errors, errorRows: structuredErrors });
      resolve();
    } catch (err: any) {
      await ImportJob.findByIdAndUpdate(importJobId, { status: 'failed', errorLog: [String(err.message || err)], errorRows: structuredErrors });
      reject(err);
    }
  });
}
