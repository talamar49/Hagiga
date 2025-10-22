const fs = require('fs');

function parseCsvText(text) {
  return text.split(/\r?\n/).filter(Boolean).map(line => line.split(',').map(c => c.trim()));
}

function validateRow(r) {
  const errors = { valid: true };
  const phone = String(r['phone number'] ?? '').trim();
  const numStr = String(r['num of participants'] ?? '').trim();
  if (!phone) { errors.phone = 'missing'; errors.valid = false; }
  if (numStr !== '') {
    if (!/^\d+$/.test(numStr) || Number(numStr) < 1) { errors.num = 'invalid'; errors.valid = false; }
  }
  return errors;
}

function analyze(file) {
  const text = fs.readFileSync(file, 'utf8');
  const parsed = parseCsvText(text);
  const dataRows = parsed.length > 0 ? parsed.slice(1) : [];
  const mapped = dataRows.map(cols => ({ name: cols[0] ?? '', lastname: cols[1] ?? '', 'num of participants': cols[2] ?? '', 'phone number': cols[3] ?? '' }));
  mapped.forEach((r, i) => {
    r._errors = validateRow(r);
    console.log(`Row ${i+1}:`, r, 'Errors:', r._errors);
  });
  const invalid = mapped.filter(r => r._errors && r._errors.valid === false);
  console.log(`\nSummary for ${file}: ${mapped.length} rows, ${invalid.length} invalid`);
}

analyze('./demo_guests.csv');
analyze('./demo_guests_valid.csv');
analyze('./demo_guests_invalid.csv');
