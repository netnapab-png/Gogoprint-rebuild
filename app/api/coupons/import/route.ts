import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { COUPON_TYPE_MAP } from '@/lib/constants';
import type { Coupon } from '@/lib/types';

interface ImportRow {
  code: string;
  type: string;
}

interface ImportResult {
  added:       number;
  skipped:     number;
  errors:      string[];
  addedCodes:  string[];
}

function parseCSV(text: string): ImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  // Detect if first line is a header (contains "code" or "type" keywords)
  let startIdx = 0;
  const firstLineLower = lines[0].toLowerCase();
  if (firstLineLower.includes('code') || firstLineLower.includes('type')) {
    startIdx = 1;
  }

  return lines.slice(startIdx).map((line) => {
    // Simple CSV split — handles basic quoted fields
    const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) ?? [];
    const clean = (s: string) => s.trim().replace(/^"|"$/g, '').trim();
    return {
      code: clean(parts[0] ?? ''),
      type: clean(parts[1] ?? ''),
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { csv?: string };
    if (!body.csv?.trim()) {
      return NextResponse.json({ success: false, error: 'No CSV data provided.' }, { status: 400 });
    }

    const rows = parseCSV(body.csv);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid rows found in CSV.' }, { status: 400 });
    }

    const data = readDb();
    const existingCodes = new Set(data.coupons.map((c) => c.code.toUpperCase()));
    const now = new Date().toISOString();

    const result: ImportResult = { added: 0, skipped: 0, errors: [], addedCodes: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNum = i + 1;

      if (!row.code) {
        result.errors.push(`Row ${lineNum}: missing coupon code.`);
        continue;
      }

      if (!row.type) {
        result.errors.push(`Row ${lineNum}: missing coupon type for code "${row.code}".`);
        continue;
      }

      const typeInfo = COUPON_TYPE_MAP[row.type];
      if (!typeInfo) {
        result.errors.push(`Row ${lineNum}: unknown coupon type "${row.type}" for code "${row.code}".`);
        continue;
      }

      if (existingCodes.has(row.code.toUpperCase())) {
        result.skipped += 1;
        continue;
      }

      const coupon: Coupon = {
        id:                  data.nextCouponId,
        code:                row.code,
        type:                row.type,
        country:             typeInfo.country,
        discount_value:      typeInfo.discountValue,
        discount_type:       typeInfo.discountType,
        is_used:             0,
        used_at:             null,
        assigned_reorder_id: null,
        created_at:          now,
      };

      data.coupons.push(coupon);
      existingCodes.add(row.code.toUpperCase());
      data.nextCouponId += 1;
      result.added += 1;
      result.addedCodes.push(row.code);
    }

    writeDb(data);

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('import error:', err);
    return NextResponse.json({ success: false, error: 'Import failed.' }, { status: 500 });
  }
}
