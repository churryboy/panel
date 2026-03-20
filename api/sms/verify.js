const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SMS_CODE_SALT = process.env.SMS_CODE_SALT || 'proby_sms_salt';

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function hashCode(code) {
  return crypto.createHash('sha256').update(`${code}:${SMS_CODE_SALT}`).digest('hex');
}

async function supabaseRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  return res;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ ok: false, error: 'Supabase env is missing' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const phone = normalizePhone(body.phone);
    const code = String(body.code || '').trim();
    if (!phone || !code) return res.status(400).json({ ok: false, error: 'Invalid payload' });

    const query = `phone_verifications?phone=eq.${phone}&status=eq.pending&select=id,code_hash,attempt_count,expires_at&order=created_at.desc&limit=1`;
    const findRes = await supabaseRequest(query, { method: 'GET' });
    if (!findRes.ok) return res.status(500).json({ ok: false, error: '조회 실패' });
    const rows = await findRes.json();
    const row = rows?.[0];
    if (!row) return res.status(400).json({ ok: false, error: '인증 대기 정보가 없습니다.' });

    if (new Date(row.expires_at).getTime() < Date.now()) {
      await supabaseRequest(`phone_verifications?id=eq.${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'expired' }),
      });
      return res.status(400).json({ ok: false, error: '인증번호가 만료되었습니다.' });
    }

    const matched = hashCode(code) === row.code_hash;
    if (!matched) {
      const nextAttempt = Number(row.attempt_count || 0) + 1;
      const patch = nextAttempt >= 5
        ? { attempt_count: nextAttempt, status: 'expired' }
        : { attempt_count: nextAttempt };
      await supabaseRequest(`phone_verifications?id=eq.${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      return res.status(400).json({ ok: false, error: '인증번호가 일치하지 않습니다.' });
    }

    await supabaseRequest(`phone_verifications?id=eq.${row.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'verified', verified_at: new Date().toISOString() }),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || 'Unknown error' });
  }
};
