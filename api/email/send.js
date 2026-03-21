/**
 * POST /api/email/send
 * 이메일로 6자리 인증코드 발송
 * 환경변수:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY  (https://resend.com — 무료: 3,000건/월)
 *   EMAIL_FROM      (예: noreply@proby.io — Resend에 등록된 도메인)
 */
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@proby.io';
const SMS_CODE_SALT = process.env.SMS_CODE_SALT || 'proby_sms_salt';

const COOLDOWN_SECONDS = 60;
const CODE_EXPIRE_SECONDS = 10 * 60; // 10분

function hashCode(code) {
  return crypto.createHash('sha256').update(`${code}:${SMS_CODE_SALT}`).digest('hex');
}

function sbHeaders() {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const requestId = crypto.randomBytes(6).toString('hex');
  const log = (level, msg, extra = {}) =>
    console[level](`[email/send][${requestId}] ${msg}`, JSON.stringify(extra));

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    log('error', 'missing supabase env');
    return res.status(500).json({ ok: false, error: 'Server configuration error' });
  }
  if (!RESEND_API_KEY) {
    log('error', 'missing RESEND_API_KEY');
    return res.status(500).json({ ok: false, error: '이메일 발송 서비스가 설정되지 않았습니다.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ ok: false, error: '올바른 이메일 주소를 입력하세요.' });
    }

    // 쿨다운 확인 (60초)
    const cooldownSince = new Date(Date.now() - COOLDOWN_SECONDS * 1000).toISOString();
    const recentRes = await fetch(
      `${SUPABASE_URL}/rest/v1/email_verifications?email=eq.${encodeURIComponent(email)}&created_at=gte.${cooldownSince}&order=created_at.desc&limit=1`,
      { headers: sbHeaders() }
    );
    if (recentRes.ok) {
      const recent = await recentRes.json();
      if (recent?.length > 0) {
        log('warn', 'cooldown active', { email });
        return res.status(429).json({ ok: false, error: `${COOLDOWN_SECONDS}초 후 재전송 가능합니다.` });
      }
    }

    // 기존 pending 코드 만료 처리
    await fetch(
      `${SUPABASE_URL}/rest/v1/email_verifications?email=eq.${encodeURIComponent(email)}&status=eq.pending`,
      {
        method: 'PATCH',
        headers: { ...sbHeaders(), Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'expired' }),
      }
    );

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + CODE_EXPIRE_SECONDS * 1000).toISOString();

    // DB 저장
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/email_verifications`, {
      method: 'POST',
      headers: { ...sbHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify([{
        email,
        code_hash: hashCode(code),
        status: 'pending',
        attempt_count: 0,
        expires_at: expiresAt,
      }]),
    });
    if (!insertRes.ok) {
      const text = await insertRes.text();
      log('error', 'insert failed', { email, status: insertRes.status, body: text });
      return res.status(500).json({ ok: false, error: '인증정보 저장 실패' });
    }

    // Resend로 이메일 발송
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [email],
        subject: '[Proby] 이메일 인증번호',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0e0f14;color:#e8e9f0;border-radius:12px;">
            <h2 style="margin:0 0 8px;font-size:20px;">Proby 이메일 인증</h2>
            <p style="color:#9ea3b0;font-size:14px;margin:0 0 24px;">아래 인증번호를 10분 이내에 입력해 주세요.</p>
            <div style="background:#1a1b23;border-radius:8px;padding:20px 24px;text-align:center;margin-bottom:24px;">
              <span style="font-size:36px;font-weight:900;letter-spacing:0.15em;color:#fff;">${code}</span>
            </div>
            <p style="color:#6b7280;font-size:12px;margin:0;">본 인증번호는 10분 후 만료됩니다. 본인이 요청하지 않았다면 이 메일을 무시하세요.</p>
          </div>
        `,
      }),
    });

    const emailData = await emailRes.json().catch(() => ({}));
    if (!emailRes.ok) {
      log('error', 'Resend failed', { email, status: emailRes.status, body: emailData });
      return res.status(500).json({ ok: false, error: '인증 이메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.' });
    }

    log('info', 'email sent', { email });
    return res.status(200).json({ ok: true });
  } catch (err) {
    log('error', 'unexpected error', { error: err?.message });
    return res.status(500).json({ ok: false, error: '서버 오류가 발생했습니다.' });
  }
};
