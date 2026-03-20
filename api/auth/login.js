const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.SMS_CODE_SALT || 'proby_session_default_change_me';
const SESSION_EXPIRE_MS = 30 * 24 * 60 * 60 * 1000; // 30일

function signToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64');
  return `${data}.${sig}`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ ok: false, error: 'Server configuration error' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { email, password } = body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: '이메일과 비밀번호를 입력하세요.' });
    }

    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/panel_users?email=eq.${encodeURIComponent(email)}&select=*&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    if (!r.ok) return res.status(500).json({ ok: false, error: '서버 오류가 발생했습니다.' });

    const rows = await r.json();
    const user = rows[0];
    if (!user) return res.status(401).json({ ok: false, error: '등록되지 않은 이메일입니다.' });

    const stored = user.password || '';
    let passwordMatch = false;

    if (stored.startsWith('$2')) {
      // bcrypt 해시
      passwordMatch = await bcrypt.compare(password, stored);
    } else {
      // 평문 레거시 — 비교 후 해시로 마이그레이션
      passwordMatch = stored === password;
      if (passwordMatch) {
        const hash = await bcrypt.hash(password, 12);
        await fetch(
          `${SUPABASE_URL}/rest/v1/panel_users?email=eq.${encodeURIComponent(email)}`,
          {
            method: 'PATCH',
            headers: {
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({ password: hash }),
          }
        );
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ ok: false, error: '비밀번호가 일치하지 않습니다.' });
    }

    const token = signToken({
      email: user.email,
      name: user.name || '',
      exp: Date.now() + SESSION_EXPIRE_MS,
    });

    const userPublic = {
      email: user.email,
      name: user.name || '',
      phone: user.phone || '',
      bankName: user.bank_name || '',
      bankAccount: user.bank_account || '',
      birthdate: user.birthdate || '',
      gender: user.gender || '',
      job: user.job || '',
      createdAt: user.created_at || new Date().toISOString(),
      phoneVerified: Boolean(user.phone_verified),
      emailNoticeAgreed: Boolean(user.email_notice_agreed),
    };

    return res.status(200).json({ ok: true, token, user: userPublic });
  } catch (err) {
    console.error('[auth/login]', err);
    return res.status(500).json({ ok: false, error: err?.message || 'Unknown error' });
  }
};
