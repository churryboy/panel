const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NCP_ACCESS_KEY = process.env.NCP_ACCESS_KEY;
const NCP_SECRET_KEY = process.env.NCP_SECRET_KEY;
const NCP_SENS_SERVICE_ID = process.env.NCP_SENS_SERVICE_ID;
const NCP_CALLING_NUMBER = process.env.NCP_CALLING_NUMBER;
const SMS_CODE_SALT = process.env.SMS_CODE_SALT || 'proby_sms_salt';

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function hashCode(code) {
  return crypto.createHash('sha256').update(`${code}:${SMS_CODE_SALT}`).digest('hex');
}

function makeSignature(method, uri, timestamp) {
  const space = ' ';
  const newLine = '\n';
  const message = [method, space, uri, newLine, timestamp, newLine, NCP_ACCESS_KEY].join('');
  return crypto.createHmac('sha256', NCP_SECRET_KEY).update(message).digest('base64');
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
  if (!NCP_ACCESS_KEY || !NCP_SECRET_KEY || !NCP_SENS_SERVICE_ID || !NCP_CALLING_NUMBER) {
    return res.status(500).json({ ok: false, error: 'NCP SMS env is missing' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const phone = normalizePhone(body.phone);
    if (phone.length < 10 || phone.length > 11) {
      return res.status(400).json({ ok: false, error: '올바른 전화번호를 입력하세요.' });
    }

    // 최근 pending 코드 무효화
    await supabaseRequest(`phone_verifications?phone=eq.${phone}&status=eq.pending`, {
      method: 'DELETE',
    });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const insertRes = await supabaseRequest('phone_verifications', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify([{
        phone,
        code_hash: hashCode(code),
        status: 'pending',
        attempt_count: 0,
        expires_at: expiresAt,
      }]),
    });

    if (!insertRes.ok) {
      const text = await insertRes.text();
      return res.status(500).json({ ok: false, error: `인증정보 저장 실패: ${text}` });
    }

    const uri = `/sms/v2/services/${NCP_SENS_SERVICE_ID}/messages`;
    const timestamp = Date.now().toString();
    const signature = makeSignature('POST', uri, timestamp);

    const smsRes = await fetch(`https://sens.apigw.ntruss.com${uri}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': NCP_ACCESS_KEY,
        'x-ncp-apigw-signature-v2': signature,
      },
      body: JSON.stringify({
        type: 'SMS',
        contentType: 'COMM',
        countryCode: '82',
        from: String(NCP_CALLING_NUMBER).replace(/\D/g, ''),
        content: `[Proby] 인증번호는 [${code}] 입니다. 5분 내 입력해 주세요.`,
        messages: [{ to: phone }],
      }),
    });

    const smsData = await smsRes.json().catch(() => ({}));
    if (!smsRes.ok || smsData.statusCode !== '202') {
      return res.status(500).json({ ok: false, error: 'SMS 발송 실패', details: smsData });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || 'Unknown error' });
  }
};
