import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { COUPON_TYPE_MAP } from '@/lib/constants';

interface ImportRow {
  code: string;
  type: string;
}

interface ImportResult {
  added:      number;
  skipped:    number;
  errors:     string[];
  addedCodes: string[];
}

function parseCSV(text: string): ImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  let startIdx = 0;
  const firstLineLower = lines[0].toLowerCase();
  if (firstLineLower.includes('code') || firstLineLower.includes('type')) {
    startIdx = 1;
  }

  return lines.slice(startIdx).map((line) => {
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
    // Identify caller via session; use admin client for all DB ops
    const sessionClient = await createClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, status')
      .eq('id', user.id)
      .single();
    if (!profile || profile.role !== 'admin' || profile.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });
    }

    const body = await req.json() as { csv?: string };
    if (!body.csv?.trim()) {
      return NextResponse.json({ success: false, error: 'No CSV data provided.' }, { status: 400 });
    }

    const rows = parseCSV(body.csv);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid rows found in CSV.' }, { status: 400 });
    }

    // Fetch existing codes to detect duplicates
    const { data: existing } = await supabase
      .from('coupons')
      .select('code');
    const existingCodes = new Set((existing ?? []).map((c) => c.code.toUpperCase()));
    const now = new Date().toISOString();

    const result: ImportResult = { added: 0, skipped: 0, errors: [], addedCodes: [] };
    const toInsert: object[] = [];

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

      toInsert.push({
        code:           row.code,
        type:           row.type,
        country:        typeInfo.country,
        discount_value: typeInfo.discountValue,
        discount_type:  typeInfo.discountType,
        is_used:        false,
        created_at:     now,
      });
      existingCodes.add(row.code.toUpperCase());
      result.addedCodes.push(row.code);
    }

    if (toInsert.length > 0) {
      const { error } = await supabase.from('coupons').insert(toInsert);
      if (error) throw error;
      result.added = toInsert.length;
    }

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('import error:', err);
    return NextResponse.json({ success: false, error: 'Import failed.' }, { status: 500 });
  }
}
