import { normalizeRow } from '../src/services/csvImport';

describe('normalizeRow', () => {
  it('should normalize various headers and return canonical fields', () => {
    const row = { 'First Name': 'Alice', 'LASTNAME': 'Smith', 'Phone_Number': '+1234567890', 'num_of_participants': '3' };
    const res = normalizeRow(row as any) as any;
    expect(res.name).toContain('Alice');
    expect(res.lastName).toBe('Smith');
    expect(res.phone).toBe('+1234567890');
    expect(res.numAttendees).toBe(3);
  });
});
