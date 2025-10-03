import fs from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import { ImportJob, Participant } from '../models';

export async function processCsv(filePath: string, eventId: any, uploadedBy: any, importJobId: any) {
  return new Promise<void>((resolve, reject) => {
  // normalize headers: trim, lowercase, replace spaces with underscores
  const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true, relax_column_count: true }));
    let total = 0;
    const errors: string[] = [];
    const tasks: Promise<void>[] = [];

    let rowIndex = 0;
    parser.on('data', (row: any) => {
      rowIndex += 1;
      total += 1;
      const task = (async () => {
        try {
          // Normalize keys for flexible CSV headers
          const normalized: Record<string, any> = {};
          for (const key of Object.keys(row)) {
            const k = String(key).trim().toLowerCase().replace(/\s+/g, '_');
            normalized[k] = row[key];
          }

          // Map user-requested columns: name, lastname, num of participants, phone number
          const name = normalized['name'] || normalized['first_name'] || normalized['first'] || normalized['full_name'] || '';
          const lastName = normalized['lastname'] || normalized['last_name'] || normalized['surname'] || '';
          const numAttendees = parseInt(String(normalized['num_of_participants'] || normalized['num_participants'] || normalized['num'] || '1'), 10) || 1;
          const phone = String(normalized['phone_number'] || normalized['phone'] || '').trim();

          if (!name) {
            errors.push(`row ${rowIndex}: missing name`);
            return;
          }
          if (!phone) {
            errors.push(`row ${rowIndex}: missing phone number`);
            return;
          }

          await Participant.create({ eventId, name: String(name).trim(), lastName: String(lastName || '').trim(), phone, numAttendees });
        } catch (err: any) {
          errors.push(`row ${rowIndex}: ${err?.message || String(err)}`);
        }
      })();
      tasks.push(task);
    });

    parser.on('end', async () => {
      try {
        await Promise.all(tasks);
        const success = total - errors.length;
        const failure = errors.length;
        await ImportJob.findByIdAndUpdate(importJobId, { status: 'done', totalRows: total, successCount: success, failureCount: failure, errorLog: errors });
        try { fs.unlinkSync(filePath); } catch (e) {}
        resolve();
      } catch (err: any) {
        await ImportJob.findByIdAndUpdate(importJobId, { status: 'failed', errorLog: [String(err.message || err)] });
        reject(err);
      }
    });

    parser.on('error', async (err: any) => {
      await ImportJob.findByIdAndUpdate(importJobId, { status: 'failed', errorLog: [String(err.message || err)] });
      reject(err);
    });
  });
}

export default { processCsv };
