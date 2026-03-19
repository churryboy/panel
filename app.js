/* ═══════════════════════════════════════════════════
   Proby 설문 패널 — Application Logic
   ═══════════════════════════════════════════════════ */

// ─── EmailJS Configuration ───
// 1. https://www.emailjs.com 에서 무료 계정 생성
// 2. Email Service 연결 (Gmail 등)
// 3. Template 생성 (변수: from_name, from_email, phone, bank_name, bank_account, amount, message)
// 4. 아래 값을 실제 키로 교체
const EMAIL_CONFIG = {
  serviceId: '',
  templateId: '',
  publicKey: '',
  recipientEmail: 'chris@proby.io',
};

// 관리자 이메일 — 이 계정으로 로그인 시 "유저 조회" 탭이 표시됩니다.
const ADMIN_EMAIL = 'chris@proby.io';

function isAdmin() {
  return state.currentUser && state.currentUser.email === ADMIN_EMAIL;
}

// ─── Sample Data ───
const SAMPLE_LISTINGS = [
  {
    id: 1,
    title: '2026 MZ세대 금융 생활 실태조사',
    description: '20~30대의 금융 생활 패턴과 은행 서비스 이용 행태를 파악하기 위한 설문조사입니다. 주 거래 은행, 모바일 뱅킹 이용 빈도, 투자·저축 습관 등에 대한 질문으로 구성되어 있습니다.',
    reward: 5000,
    surveyLink: 'https://forms.gle/example1',
    deadline: '2026-03-15',
    status: 'closed',
    category: '금융',
    estimatedTime: '15분',
    maxParticipants: 100,
    currentParticipants: 100,
  },
  {
    id: 2,
    title: '외식 브랜드 인지도 및 선호도 조사',
    description: '국내 주요 외식 브랜드에 대한 인지도, 방문 빈도, 메뉴 선호도를 조사합니다. 최근 3개월 내 외식 경험이 있는 분이라면 누구나 참여 가능합니다.',
    reward: 3000,
    surveyLink: 'https://forms.gle/example2',
    deadline: '2026-03-10',
    status: 'closed',
    category: '외식·F&B',
    estimatedTime: '10분',
    maxParticipants: 80,
    currentParticipants: 80,
  },
  {
    id: 3,
    title: '자동차 구매 경험 심층 설문',
    description: '최근 2년 내 자동차를 구매하신 분들을 대상으로, 구매 과정에서의 정보 탐색 경로, 딜러십 경험, 브랜드 선택 요인 등을 심층적으로 파악합니다.',
    reward: 8000,
    surveyLink: 'https://forms.gle/example3',
    deadline: '2026-03-01',
    status: 'closed',
    category: '자동차',
    estimatedTime: '20분',
    maxParticipants: 50,
    currentParticipants: 50,
  },
  {
    id: 4,
    title: '재택근무 만족도 및 생산성 조사',
    description: '재택근무 또는 하이브리드 근무를 경험한 직장인을 대상으로, 업무 환경 만족도와 생산성 변화를 조사합니다.',
    reward: 4000,
    surveyLink: 'https://forms.gle/example4',
    deadline: '2026-02-20',
    status: 'closed',
    category: '근무환경',
    estimatedTime: '12분',
    maxParticipants: 60,
    currentParticipants: 60,
  },
  {
    id: 5,
    title: '디지털 헬스케어 앱 사용 경험 조사',
    description: '건강 관리 앱, 운동 기록 앱, 식단 관리 앱 등 디지털 헬스케어 서비스 이용 현황과 만족도를 파악합니다.',
    reward: 3500,
    surveyLink: 'https://forms.gle/example5',
    deadline: '2026-03-02',
    status: 'closed',
    category: '헬스케어',
    estimatedTime: '8분',
    maxParticipants: 70,
    currentParticipants: 70,
  },
  {
    id: 6,
    title: 'OTT 서비스 이용 패턴 조사',
    description: '넷플릭스, 웨이브, 쿠팡플레이 등 OTT 서비스 이용 행태와 콘텐츠 소비 패턴을 파악하는 설문입니다.',
    reward: 4500,
    surveyLink: 'https://forms.gle/example6',
    deadline: '2026-02-30',
    status: 'closed',
    category: '미디어·콘텐츠',
    estimatedTime: '15분',
    maxParticipants: 90,
    currentParticipants: 90,
  },
  {
    id: 8,
    title: 'AI 인터뷰어와의 대화 경험 평가 조사',
    description: 'AI와 인터뷰를 하는 경험에 대한 인식 탐구',
    reward: 1000,
    surveyLink: 'https://www.proby.io/interview?t=4tpUwos0',
    deadline: '2026-12-31',
    status: 'active',
    category: 'AI',
    estimatedTime: '3~5분',
    maxParticipants: 100,
    currentParticipants: 0,
  },
  {
    id: 9,
    title: '뱅킹 앱 디자인 평가 조사',
    description: '뱅킹 앱을 사용하실 때, 더 선호하는 디자인이 무엇인지를 이해하기 위해 기획된 조사입니다',
    reward: 5000,
    surveyLink: 'https://www.proby.io/interview?t=1Fw2FPzQT',
    deadline: '2026-03-24',
    status: 'active',
    category: '금융',
    estimatedTime: '15~20분',
    maxParticipants: 5,
    currentParticipants: 0,
  },
];

// ─── State ───
const state = {
  currentUser: null,
  currentTab: 'listings',
  currentListing: null,
  searchQuery: '',
};

// ─── Storage Keys ───
const KEYS = {
  users: 'sp_users',
  session: 'sp_session',
  listings: 'sp_listings',
  completed: 'sp_completed',
  payouts: 'sp_payouts',
  settlementCompleted: 'sp_settlement_completed',
};

// ─── Storage Helpers ───
function getStore(key, fallback = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Mixpanel: 설문 참여 클릭 로깅 (SDK 실패 시 Track API 폴백) ───
var MIXPANEL_TOKEN = typeof window !== 'undefined' && window.MIXPANEL_TOKEN ? window.MIXPANEL_TOKEN : '1a30b5a4b298ee5477f21dc2a26e2307';

function getDistinctId() {
  if (typeof state !== 'undefined' && state.currentUser && state.currentUser.name) {
    var name = String(state.currentUser.name).trim();
    if (name) return name;
  }
  try {
    var key = 'sp_mixpanel_distinct_id';
    var id = localStorage.getItem(key);
    if (!id) {
      id = 'anon_' + Math.random().toString(36).slice(2) + '_' + Date.now();
      localStorage.setItem(key, id);
    }
    return id;
  } catch (e) {
    return 'anon_' + Date.now();
  }
}

function sendMixpanelEvent(eventName, props) {
  var distinctId = getDistinctId();
  if (typeof window.mixpanel !== 'undefined' && window.mixpanel.track) {
    try {
      window.mixpanel.identify(distinctId);
      window.mixpanel.track(eventName, props);
    } catch (e) {}
  }
  try {
    var event = {
      event: eventName,
      properties: {
        token: MIXPANEL_TOKEN,
        distinct_id: distinctId,
        time: Math.floor(Date.now() / 1000),
      },
    };
    for (var k in props) event.properties[k] = props[k];
    var data = btoa(unescape(encodeURIComponent(JSON.stringify([event]))));
    fetch('https://api.mixpanel.com/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(data),
    }).catch(function () {});
  } catch (e) {}
}

function trackSurveyClick(payload) {
  sendMixpanelEvent('클릭 - ' + (payload.title || '제목 없음'), {
    title: payload.title,
    listing_id: payload.listing_id,
    category: payload.category || '',
    source: payload.source || 'card',
  });
}

/** 관리자가 조사 추가 모달로 새 공고를 생성했을 때 */
function trackListingCreated(listing) {
  if (!listing) return;
  sendMixpanelEvent('조사 생성 - ' + (listing.title || '제목 없음'), {
    title: listing.title,
    listing_id: listing.id,
    category: listing.category || '',
    deadline: listing.deadline || '',
    max_participants: listing.maxParticipants,
    estimated_time: listing.estimatedTime || '',
    source: 'admin_create',
  });
}

// ─── Data Initialization ───
function initData() {
  const stored = getStore(KEYS.listings);
  if (!stored || stored.length === 0) {
    setStore(KEYS.listings, SAMPLE_LISTINGS);
  } else {
    const byId = new Map(stored.map(l => [l.id, l]));
    SAMPLE_LISTINGS.forEach(sample => {
      const existing = byId.get(sample.id);
      byId.set(sample.id, existing ? { ...existing, ...sample } : sample);
    });
    setStore(KEYS.listings, [...byId.values()]);
  }
  if (!getStore(KEYS.users)) {
    setStore(KEYS.users, []);
  }
  if (!getStore(KEYS.completed)) {
    setStore(KEYS.completed, []);
  }
  if (!getStore(KEYS.payouts)) {
    setStore(KEYS.payouts, []);
  }
  if (!getStore(KEYS.settlementCompleted)) {
    setStore(KEYS.settlementCompleted, []);
  }
}

// ─── Auth ───
function getUsers() { return getStore(KEYS.users, []); }

function normalizePhone(phone) {
  return (phone || '').replace(/\D/g, '');
}

function findUser(email) {
  return getUsers().find(u => u.email === email);
}

function findUserByPhone(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return getUsers().find(u => normalizePhone(u.phone) === normalized);
}

// 인증번호 발급 상태 (데모: 메모리 저장. 실제 서비스에서는 백엔드에서 SMS 발송 후 세션/DB에 저장)
let pendingVerification = { phone: '', code: '', expiresAt: 0 };
const VERIFY_EXPIRE_MS = 5 * 60 * 1000; // 5분

function sendVerificationCode(phone) {
  const normalized = normalizePhone(phone);
  if (normalized.length < 10) return { ok: false, error: '올바른 전화번호를 입력하세요.' };
  if (findUserByPhone(phone)) return { ok: false, error: '이미 가입된 전화번호입니다.' };

  const code = String(Math.floor(100000 + Math.random() * 900000));
  pendingVerification = { phone: normalized, code, expiresAt: Date.now() + VERIFY_EXPIRE_MS };
  return { ok: true, code };
}

function verifyCode(phone, inputCode) {
  const normalized = normalizePhone(phone);
  if (pendingVerification.phone !== normalized) return false;
  if (Date.now() > pendingVerification.expiresAt) return false;
  return pendingVerification.code === (inputCode || '').trim();
}

function register(name, email, password, phone, verificationCode) {
  if (findUser(email)) return { ok: false, error: '이미 가입된 이메일입니다.' };
  if (findUserByPhone(phone)) return { ok: false, error: '이미 가입된 전화번호입니다.' };
  if (password.length < 6) return { ok: false, error: '비밀번호는 6자 이상이어야 합니다.' };
  if (!verifyCode(phone, verificationCode)) return { ok: false, error: '인증번호가 일치하지 않거나 만료되었습니다. 다시 받아 입력하세요.' };

  const normalizedPhone = normalizePhone(phone);
  const users = getUsers();
  users.push({
    name,
    email,
    password,
    phone: normalizedPhone,
    createdAt: new Date().toISOString(),
    bankName: '',
    bankAccount: '',
  });
  setStore(KEYS.users, users);
  pendingVerification = { phone: '', code: '', expiresAt: 0 };
  return { ok: true };
}

function deleteUser(email) {
  const users = getUsers().filter(u => u.email !== email);
  setStore(KEYS.users, users);
}

function saveBankInfo(bankName, bankAccount) {
  if (!state.currentUser) return;
  const users = getUsers();
  const idx = users.findIndex(u => u.email === state.currentUser.email);
  if (idx === -1) return;
  users[idx].bankName = bankName;
  users[idx].bankAccount = bankAccount;
  setStore(KEYS.users, users);
  state.currentUser.bankName = bankName;
  state.currentUser.bankAccount = bankAccount;
}

function saveProfile(name, birthdate, gender, job) {
  if (!state.currentUser) return;
  const users = getUsers();
  const idx = users.findIndex(u => u.email === state.currentUser.email);
  if (idx === -1) return;
  users[idx].name = name;
  users[idx].birthdate = birthdate;
  users[idx].gender = gender;
  users[idx].job = job;
  setStore(KEYS.users, users);
  Object.assign(state.currentUser, { name, birthdate, gender, job });
  document.getElementById('header-user-name').textContent = name;
  if (window.mixpanel && window.mixpanel.identify && name) {
    window.mixpanel.identify(String(name).trim());
  }
}

function login(email, password) {
  const user = findUser(email);
  if (!user) return { ok: false, error: '등록되지 않은 이메일입니다.' };
  if (user.password !== password) return { ok: false, error: '비밀번호가 일치하지 않습니다.' };

  setStore(KEYS.session, email);
  state.currentUser = user;
  if (window.mixpanel && window.mixpanel.identify && user.name) {
    window.mixpanel.identify(String(user.name).trim());
  }
  return { ok: true };
}

function logout() {
  localStorage.removeItem(KEYS.session);
  state.currentUser = null;
  showView('login');
}

function checkSession() {
  const email = getStore(KEYS.session);
  if (email) {
    const user = findUser(email);
    if (user) {
      state.currentUser = user;
      if (window.mixpanel && window.mixpanel.identify && user.name) {
        window.mixpanel.identify(String(user.name).trim());
      }
      return true;
    }
  }
  return false;
}

// ─── Listings ───
function getListings() {
  const list = getStore(KEYS.listings, SAMPLE_LISTINGS);
  return [...list].sort((a, b) => (b.id - a.id)); // 최신 등록(id 큰 것) 순
}

function getListingById(id) {
  return getListings().find(l => l.id === id);
}

function getDeadlineEndTime(deadline) {
  if (!deadline) return NaN;
  const d = new Date(deadline);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function getListingParticipantCount(listingId, listing) {
  if (listing && typeof listing.currentParticipants === 'number') {
    return listing.currentParticipants;
  }
  const participants = new Set(
    getCompleted()
      .filter(c => c.listingId === listingId)
      .map(c => c.userEmail)
  );
  return participants.size;
}

// 마감 조건: 데드라인 지남 OR 참여인원 마감 (둘 중 하나만 해당해도 마감)
function isListingClosed(listing) {
  if (!listing) return true;
  const deadlinePassed = Date.now() > getDeadlineEndTime(listing.deadline);
  const maxParticipants = Number(listing.maxParticipants) || 0;
  const isFull = maxParticipants > 0 && getListingParticipantCount(listing.id, listing) >= maxParticipants;
  return deadlinePassed || isFull; // OR 조건
}

// ─── Settlement completed (정산완료) ───
// 저장 형식: [{ email, completedAt }, ...]. 레거시: [email, ...] → completedAt 과거로 간주
function getSettlementCompleted() {
  const raw = getStore(KEYS.settlementCompleted, []);
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map(entry =>
    typeof entry === 'string'
      ? { email: entry, completedAt: new Date(0).toISOString() }
      : { email: entry.email, completedAt: entry.completedAt || new Date(0).toISOString() }
  );
}

function getSettlementCompletedAt(email) {
  const list = getSettlementCompleted();
  const found = list.find(e => e.email === email);
  return found ? found.completedAt : null;
}

function isSettlementCompleted(email) {
  return getSettlementCompletedAt(email) !== null;
}

function markSettlementCompleted(email) {
  const list = getSettlementCompleted().filter(e => e.email !== email);
  setStore(KEYS.settlementCompleted, [...list, { email, completedAt: new Date().toISOString() }]);
}

// ─── Completed Surveys ───
function getCompleted() {
  return getStore(KEYS.completed, []);
}

function getUserCompleted() {
  if (!state.currentUser) return [];
  return getCompleted().filter(c => c.userEmail === state.currentUser.email);
}

function markCompleted(listingId) {
  if (!state.currentUser) return;
  const listing = getListingById(listingId);
  if (!listing) return;
  if (isListingClosed(listing)) return;

  const completed = getCompleted();
  const exists = completed.find(
    c => c.userEmail === state.currentUser.email && c.listingId === listingId
  );
  if (exists) return;

  completed.push({
    userEmail: state.currentUser.email,
    listingId,
    completedAt: new Date().toISOString(),
    reward: getListingReward(listing),
    title: listing.title,
  });
  setStore(KEYS.completed, completed);
}

function isCompleted(listingId) {
  if (!state.currentUser) return false;
  return getCompleted().some(
    c => c.userEmail === state.currentUser.email && c.listingId === listingId
  );
}

// ─── Payouts ───
function getPayouts() { return getStore(KEYS.payouts, []); }

function getUserPayouts() {
  if (!state.currentUser) return [];
  return getPayouts().filter(p => p.userEmail === state.currentUser.email);
}

function getUnpaidTotal() {
  if (state.currentUser && isSettlementCompleted(state.currentUser.email)) {
    return 0;
  }
  const completed = getUserCompleted();
  const payouts = getUserPayouts();
  const paidTotal = payouts.reduce((sum, p) => sum + p.amount, 0);
  const earnedTotal = completed.reduce((sum, c) => sum + c.reward, 0);
  return earnedTotal - paidTotal;
}

function addPayout(name, phone, bankName, bankAccount) {
  const amount = getUnpaidTotal();
  if (amount <= 0) return { ok: false, error: '정산할 금액이 없습니다.' };

  const payouts = getPayouts();
  const payout = {
    userEmail: state.currentUser.email,
    userName: name,
    phone,
    bankName,
    bankAccount,
    amount,
    requestedAt: new Date().toISOString(),
  };
  payouts.push(payout);
  setStore(KEYS.payouts, payouts);
  return { ok: true, payout };
}

// ─── Email ───
async function sendPayoutEmail(payout) {
  const configured = EMAIL_CONFIG.serviceId && EMAIL_CONFIG.templateId && EMAIL_CONFIG.publicKey;

  if (configured) {
    try {
      emailjs.init(EMAIL_CONFIG.publicKey);
      await emailjs.send(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.templateId, {
        to_email: EMAIL_CONFIG.recipientEmail,
        from_name: payout.userName,
        from_email: payout.userEmail,
        phone: payout.phone,
        bank_name: payout.bankName,
        bank_account: payout.bankAccount,
        amount: payout.amount.toLocaleString(),
        message: `정산 요청이 접수되었습니다.\n\n이름: ${payout.userName}\n이메일: ${payout.userEmail}\n전화번호: ${payout.phone}\n은행: ${payout.bankName}\n계좌번호: ${payout.bankAccount}\n금액: ${payout.amount.toLocaleString()}원\n요청일시: ${new Date(payout.requestedAt).toLocaleString('ko-KR')}`,
      });
      return { ok: true, method: 'emailjs' };
    } catch (err) {
      console.error('EmailJS error:', err);
      return { ok: false, method: 'emailjs', error: err };
    }
  }

  const subject = encodeURIComponent(`[AI 인터뷰 조사 정산 요청] ${payout.userName} — ${payout.amount.toLocaleString()}원`);
  const body = encodeURIComponent(
    `정산 요청이 접수되었습니다.\n\n` +
    `이름: ${payout.userName}\n` +
    `이메일: ${payout.userEmail}\n` +
    `전화번호: ${payout.phone}\n` +
    `은행: ${payout.bankName}\n` +
    `계좌번호: ${payout.bankAccount}\n` +
    `금액: ${payout.amount.toLocaleString()}원\n` +
    `요청일시: ${new Date(payout.requestedAt).toLocaleString('ko-KR')}`
  );
  window.open(`mailto:${EMAIL_CONFIG.recipientEmail}?subject=${subject}&body=${body}`, '_blank');
  return { ok: true, method: 'mailto' };
}

// ─── View Management ───
function showView(name) {
  const loginView = document.getElementById('login-view');
  const appView = document.getElementById('app-view');

  if (name === 'login') {
    loginView.classList.remove('hidden');
    appView.classList.add('hidden');
  } else {
    loginView.classList.add('hidden');
    appView.classList.remove('hidden');
    document.getElementById('header-user-name').textContent = state.currentUser?.name || '';
    const tabUsers = document.getElementById('tab-users');
    if (tabUsers) tabUsers.classList.toggle('hidden', !isAdmin());
    switchTab(state.currentTab);
  }
}

function switchTab(tab) {
  state.currentTab = tab;

  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  document.querySelectorAll('.content-panel').forEach(p => p.classList.add('hidden'));

  if (tab === 'listings') {
    document.getElementById('listings-view').classList.remove('hidden');
    renderListings();
  } else if (tab === 'settlement') {
    document.getElementById('settlement-view').classList.remove('hidden');
    renderSettlement();
  } else if (tab === 'users') {
    const panel = document.getElementById('users-view');
    if (panel) {
      panel.classList.remove('hidden');
      renderUsers();
    }
  }
}


// ─── Render: Listings ───
function buildListingCard(listing) {
  const completed = isCompleted(listing.id);
  const participants = getListingParticipantCount(listing.id, listing);
  const maxParticipants = Number(listing.maxParticipants) || 0;
  const isActive = !isListingClosed(listing);
  const actionBtn = completed
    ? `<button class="card-btn-done" disabled>
         <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL'1">check_circle</span>
         검토 중
       </button>`
    : isActive
      ? `<a href="${listing.surveyLink}" target="_blank" rel="noopener noreferrer"
            class="card-btn-survey" data-id="${listing.id}">
           <span class="material-symbols-outlined text-base">open_in_new</span>
           설문 참여
         </a>`
      : `<span class="card-btn-closed">마감됨</span>`;
  return `
    <div class="listing-card${completed ? ' listing-card--done' : ''}">
      <div class="listing-card-header">
        <div class="flex flex-wrap gap-1.5">
          <span class="badge badge-category">${listing.category}</span>
        </div>
        <span class="badge ${!isActive ? 'badge-closed' : (completed || listing.deadline) ? 'badge-done' : 'badge-active'}">
          ${!isActive ? '마감' : completed ? (listing.deadline ? `${formatDate(listing.deadline)} 마감` : '검토 중') : (listing.deadline ? `${formatDate(listing.deadline)} 마감` : '모집중')}
        </span>
      </div>
      <div class="listing-card-body">
        <h3 class="text-sm font-bold leading-snug mb-1.5">${listing.title}</h3>
        <p class="text-xs text-white/45 leading-relaxed line-clamp-2">${listing.description}</p>
      </div>
      <div class="listing-card-footer">
        <div class="listing-card-footer-row">
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">schedule</span>
            ${listing.estimatedTime}
          </span>
          ${maxParticipants > 0 ? `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">group</span>${Math.min(participants, maxParticipants).toLocaleString()}/${maxParticipants.toLocaleString()}명</span>` : ''}
          <span class="font-bold text-yellow-300/90">${getListingReward(listing).toLocaleString()}원</span>
        </div>
        <div class="listing-card-footer-cta">${actionBtn}</div>
      </div>
    </div>
  `;
}

function renderListings() {
  const sectionsEl = document.getElementById('listings-sections');
  const emptyEl = document.getElementById('listings-empty');
  const gridActive = document.getElementById('listings-grid-active');
  const gridClosed = document.getElementById('listings-grid-closed');
  const emptyActive = document.getElementById('listings-active-empty');
  const emptyClosed = document.getElementById('listings-closed-empty');
  const query = state.searchQuery.toLowerCase().trim();
  const btnAdd = document.getElementById('btn-add-listing');
  if (btnAdd) btnAdd.classList.toggle('hidden', !isAdmin());

  let listings = getListings();
  if (query) {
    listings = listings.filter(l =>
      l.title.toLowerCase().includes(query) ||
      l.category.toLowerCase().includes(query) ||
      l.description.toLowerCase().includes(query)
    );
  }

  const activeListings = listings.filter(l => !isListingClosed(l));
  const closedListings = listings.filter(l => isListingClosed(l));

  if (listings.length === 0) {
    if (sectionsEl) sectionsEl.classList.add('hidden');
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');
  if (sectionsEl) sectionsEl.classList.remove('hidden');

  if (gridActive) {
    gridActive.innerHTML = activeListings.map(buildListingCard).join('');
    gridActive.classList.toggle('hidden', activeListings.length === 0);
  }
  if (emptyActive) {
    emptyActive.classList.toggle('hidden', activeListings.length > 0);
  }
  if (gridClosed) {
    gridClosed.innerHTML = closedListings.map(buildListingCard).join('');
    gridClosed.classList.toggle('hidden', closedListings.length === 0);
  }
  if (emptyClosed) {
    emptyClosed.classList.toggle('hidden', closedListings.length > 0);
  }

  const container = sectionsEl || document.body;
  container.querySelectorAll('.card-btn-survey').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const listing = getListingById(id);
      if (listing) trackSurveyClick({ title: listing.title, listing_id: listing.id, category: listing.category, source: 'card' });
      markCompleted(id);
      renderListings();
      showToast('검토 중으로 기록되었습니다.');
    });
  });
}

// ─── Render: Detail ───
function renderDetail(listingId) {
  const listing = getListingById(listingId);
  if (!listing) return;

  const completed = isCompleted(listingId);
  const isActive = !isListingClosed(listing);
  const container = document.getElementById('detail-content');

  container.innerHTML = `
    <div class="detail-hero">
      <div class="flex flex-wrap gap-2 mb-4">
        <span class="badge badge-category">${listing.category}</span>
        <span class="badge ${!isActive ? 'badge-closed' : (completed || listing.deadline) ? 'badge-done' : 'badge-active'}">
          ${!isActive ? '마감' : completed ? (listing.deadline ? formatDate(listing.deadline) + ' 마감' : '검토 중') : (listing.deadline ? formatDate(listing.deadline) + ' 마감' : '모집중')}
        </span>
      </div>
      <h1 class="text-2xl md:text-3xl font-black tracking-tight leading-tight mb-3">
        ${listing.title}
      </h1>
      <p class="text-sm text-white/50 leading-relaxed max-w-2xl">
        ${listing.description}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="detail-section">
        <div class="flex items-center gap-2 mb-2">
          <span class="material-symbols-outlined text-accent-text text-lg">payments</span>
          <span class="text-xs font-semibold text-white/40 uppercase tracking-wider">사례비</span>
        </div>
        <p class="text-xl font-black">${getListingReward(listing).toLocaleString()}<span class="text-sm font-semibold text-white/40 ml-1">원</span></p>
      </div>
      <div class="detail-section">
        <div class="flex items-center gap-2 mb-2">
          <span class="material-symbols-outlined text-accent-text text-lg">schedule</span>
          <span class="text-xs font-semibold text-white/40 uppercase tracking-wider">예상 소요시간</span>
        </div>
        <p class="text-xl font-black">${listing.estimatedTime}</p>
      </div>
      <div class="detail-section">
        <div class="flex items-center gap-2 mb-2">
          <span class="material-symbols-outlined text-accent-text text-lg">event</span>
          <span class="text-xs font-semibold text-white/40 uppercase tracking-wider">마감일</span>
        </div>
        <p class="text-xl font-black">${formatDate(listing.deadline)}</p>
      </div>
    </div>

    <div class="detail-action">
      ${isActive && !completed ? `
        <a href="${listing.surveyLink}" target="_blank" rel="noopener noreferrer" class="btn-survey">
          <span class="material-symbols-outlined">open_in_new</span>
          설문 참여하기
        </a>
        <button class="btn-complete" data-listing-id="${listing.id}">
          <span class="material-symbols-outlined">check_circle</span>
          참여 완료 표시
        </button>
      ` : completed ? `
        <div class="flex items-center gap-2 text-accent-lt text-sm font-semibold">
          <span class="material-symbols-outlined">schedule</span>
          검토 중
        </div>
      ` : `
        <div class="flex items-center gap-2 text-white/40 text-sm font-semibold">
          <span class="material-symbols-outlined">block</span>
          마감된 설문입니다
        </div>
      `}
    </div>
  `;

  const completeBtn = container.querySelector('.btn-complete');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      markCompleted(listingId);
      renderDetail(listingId);
      showToast('검토 중으로 기록되었습니다.');
    });
  }
  const surveyLinkEl = container.querySelector('.btn-survey');
  if (surveyLinkEl) {
    surveyLinkEl.addEventListener('click', () => {
      trackSurveyClick({ title: listing.title, listing_id: listing.id, category: listing.category, source: 'detail' });
    });
  }
}

// ─── Render: Settlement ───
function renderSettlement() {
  const list = document.getElementById('settlement-list');
  const empty = document.getElementById('settlement-empty');
  const totalEl = document.getElementById('total-amount');

  const completed = getUserCompleted();
  const unpaidTotal = getUnpaidTotal();

  if (totalEl) totalEl.textContent = unpaidTotal.toLocaleString();

  // 계좌정보 카드 렌더링
  const bankCard = document.getElementById('bank-info-card');
  if (bankCard) {
    const u = findUser(state.currentUser.email) || state.currentUser;
    const hasBankInfo = u.bankName && u.bankAccount;
    bankCard.innerHTML = `
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl bg-accent-dim/40 border border-accent-hi/20 flex items-center justify-center">
          <span class="material-symbols-outlined text-accent-text text-lg">account_balance</span>
        </div>
        <div>
          <p class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-0.5">계좌 정보</p>
          ${hasBankInfo
            ? `<p class="text-sm font-bold">${escapeHtml(u.bankName)} <span class="text-white/50 font-normal">${escapeHtml(u.bankAccount)}</span></p>`
            : `<p class="text-sm text-white/40">등록된 계좌가 없습니다</p>`
          }
        </div>
        <button id="btn-toggle-bank-form" class="ml-auto text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors
          ${hasBankInfo
            ? 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
            : 'border-accent-hi/40 text-accent-lt hover:bg-accent/20'}">
          ${hasBankInfo ? '수정' : '계좌정보 등록'}
        </button>
      </div>
      <div id="bank-form" class="hidden space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">은행명</label>
            <input type="text" id="bank-name-input" class="sf-input w-full" placeholder="하나은행" value="${escapeHtml(u.bankName || '')}">
          </div>
          <div>
            <label class="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">계좌번호</label>
            <input type="text" id="bank-account-input" class="sf-input w-full" placeholder="000-0000-0000" value="${escapeHtml(u.bankAccount || '')}">
          </div>
        </div>
        <div class="flex gap-2 pt-1">
          <button id="btn-save-bank" class="btn-primary px-5 py-2 text-xs font-bold">저장</button>
          <button id="btn-cancel-bank" class="btn-ghost px-5 py-2 text-xs font-bold">취소</button>
        </div>
      </div>
    `;

    document.getElementById('btn-toggle-bank-form').addEventListener('click', () => {
      document.getElementById('bank-form').classList.toggle('hidden');
    });
    document.getElementById('btn-cancel-bank').addEventListener('click', () => {
      document.getElementById('bank-form').classList.add('hidden');
    });
    document.getElementById('btn-save-bank').addEventListener('click', () => {
      const bn = document.getElementById('bank-name-input').value.trim();
      const ba = document.getElementById('bank-account-input').value.trim();
      if (!bn || !ba) { showToast('은행명과 계좌번호를 모두 입력하세요.'); return; }
      saveBankInfo(bn, ba);
      showToast('계좌정보가 저장되었습니다!');
      renderSettlement();
    });
  }

  if (completed.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  const payoutHistory = getUserPayouts();
  const settledAt = state.currentUser ? getSettlementCompletedAt(state.currentUser.email) : null;

  list.innerHTML =
    completed.map(c => {
      const completedTime = c.completedAt ? new Date(c.completedAt).getTime() : 0;
      const settledTime = settledAt ? new Date(settledAt).getTime() : 0;
      const isLegacySettled = settledTime < 1e12; // 예전 형식(날짜 없음)이면 전체 배지
      const showBadge = settledAt && (isLegacySettled || completedTime < settledTime);
      return `
      <div class="settlement-item">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-accent-dim/40 border border-accent-hi/20 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-accent-text text-lg">description</span>
          </div>
          <div>
            <p class="text-sm font-semibold leading-tight flex items-center gap-2 flex-wrap">
              ${c.title}
              ${showBadge ? '<span class="badge-settlement-done">정산 완료</span>' : '<span class="badge-review">검토중</span>'}
            </p>
            <p class="text-xs text-white/35 mt-0.5">${formatDate(c.completedAt)}</p>
          </div>
        </div>
        <span class="text-sm font-bold text-yellow-300/90 whitespace-nowrap">+${c.reward.toLocaleString()}원</span>
      </div>
    `;
    }).join('') +
    (payoutHistory.length > 0 ? `
      <div class="mt-8 mb-4">
        <h3 class="text-sm font-bold text-white/60 uppercase tracking-wider">정산 요청 내역</h3>
      </div>
      ${payoutHistory.map(p => `
        <div class="settlement-item" style="border-color: rgba(34,197,94,0.2)">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-green-900/30 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-green-400 text-lg">receipt</span>
            </div>
            <div>
              <p class="text-sm font-semibold leading-tight">정산 요청</p>
              <p class="text-xs text-white/35 mt-0.5">${formatDate(p.requestedAt)} · ${p.bankName} ${p.bankAccount}</p>
            </div>
          </div>
          <span class="text-sm font-bold text-green-400/90 whitespace-nowrap">-${p.amount.toLocaleString()}원</span>
        </div>
      `).join('')}
    ` : '');
}

// ─── Render: Users (Admin) ───
function renderUsers() {
  const container = document.getElementById('users-list');
  const empty = document.getElementById('users-empty');
  if (!container) return;

  const users = getUsers();
  const completed = getCompleted();
  const listings = getListings();

  const byEmail = {};
  completed.forEach(c => {
    if (!byEmail[c.userEmail]) byEmail[c.userEmail] = { count: 0, total: 0 };
    byEmail[c.userEmail].count += 1;
    byEmail[c.userEmail].total += c.reward;
  });

  const activeListings = (listings || [])
    .filter(l => l && !isListingClosed(l))
    .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

  const participantsByListingId = {};
  completed.forEach(c => {
    const id = Number(c.listingId);
    if (!id) return;
    if (!participantsByListingId[id]) participantsByListingId[id] = new Set();
    participantsByListingId[id].add(c.userEmail);
  });

  const participantSectionHtml =
    activeListings.length === 0
      ? `<div class="px-6 py-8 text-sm text-white/40">진행중인 조사가 없습니다</div>`
      : activeListings.map(listing => {
          const set = participantsByListingId[listing.id] || new Set();
          const emails = Array.from(set);
          const rows = emails.map(email => {
            const u = users.find(x => x.email === email);
            const name = u?.name || '—';
            const phoneDisplay = u?.phone ? u.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3') : '—';
            return `
            <tr>
              <td>${escapeHtml(name)}</td>
              <td class="text-white/60">${escapeHtml(email)}</td>
              <td class="text-white/60">${escapeHtml(phoneDisplay)}</td>
            </tr>
          `;
          }).join('');

          return `
          <div class="mb-8 last:mb-0 px-6 pt-6">
            <div class="flex items-center justify-between gap-3 mb-3">
              <div class="min-w-0">
                <p class="text-sm font-bold truncate">${escapeHtml(listing.title || '제목 없음')}</p>
                <p class="text-xs text-white/35 mt-0.5">
                  참여자 ${emails.length.toLocaleString()}명
                  ${listing.maxParticipants ? ` / 최종모수 ${Number(listing.maxParticipants).toLocaleString()}명` : ''}
                </p>
              </div>
              <span class="badge badge-active">진행중</span>
            </div>
            <div class="overflow-x-auto rounded-xl border border-white/5">
              <table class="users-table users-table-nowrap">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>전화번호</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows || `<tr><td class="text-white/40" colspan="3">참여자가 없습니다</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        `;
        }).join('');

  if (users.length === 0) {
    container.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
  } else {
    if (empty) empty.classList.add('hidden');
    container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="users-table users-table-nowrap">
        <thead>
          <tr>
            <th>총 사례비</th>
            <th>은행명</th>
            <th>계좌번호</th>
            <th>정산완료</th>
            <th>이름</th>
            <th>이메일</th>
            <th>전화번호</th>
            <th>가입일</th>
            <th>생년월일</th>
            <th>성별</th>
            <th>직업</th>
            <th>완료 설문</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${users.map(u => {
            const stat = byEmail[u.email] || { count: 0, total: 0 };
            const displayTotal = isSettlementCompleted(u.email) ? 0 : stat.total;
            const joined = u.createdAt ? formatDate(u.createdAt) : '—';
            const isMe = u.email === state.currentUser.email;
            const phoneDisplay = u.phone ? u.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3') : '—';
            const settled = isSettlementCompleted(u.email);
            return `
              <tr>
                <td class="text-yellow-300/80">${displayTotal.toLocaleString()}원</td>
                <td class="text-white/60">${escapeHtml(u.bankName || '—')}</td>
                <td class="text-white/60">${escapeHtml(u.bankAccount || '—')}</td>
                <td>
                  ${settled
                    ? '<span class="text-white/40 text-xs">완료</span>'
                    : `<button class="btn-settlement-done text-xs font-bold text-accent-lt hover:text-white transition-colors px-2 py-1 rounded hover:bg-accent/20" data-email="${escapeHtml(u.email)}">정산완료</button>`
                  }
                </td>
                <td>${escapeHtml(u.name)}</td>
                <td class="text-white/60">${escapeHtml(u.email)}</td>
                <td class="text-white/60">${escapeHtml(phoneDisplay)}</td>
                <td class="text-white/50">${joined}</td>
                <td class="text-white/60">${escapeHtml(u.birthdate || '—')}</td>
                <td class="text-white/60">${escapeHtml(u.gender || '—')}</td>
                <td class="text-white/60">${escapeHtml(u.job || '—')}</td>
                <td>${stat.count}건</td>
                <td>
                  ${isMe ? '' : `
                    <button class="btn-delete-user text-xs font-bold text-red-400/70 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-400/10"
                      data-email="${escapeHtml(u.email)}">삭제</button>
                  `}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
    container.querySelectorAll('.btn-settlement-done').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.dataset.email;
        if (!confirm(`"${email}" 유저의 정산을 완료 처리하시겠습니까? 합산 금액이 0으로 표시됩니다.`)) return;
        markSettlementCompleted(email);
        renderUsers();
        showToast('정산 완료 처리되었습니다.');
      });
    });
    container.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.dataset.email;
        if (!confirm(`"${email}" 유저를 삭제하시겠습니까?`)) return;
        deleteUser(email);
        renderUsers();
        showToast('유저가 삭제되었습니다.');
      });
    });
  }

  const participantsEl = document.getElementById('users-participants');
  if (participantsEl) participantsEl.innerHTML = participantSectionHtml;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ─── Utilities ───
// estimatedTime(예: "5분", "3~5분", "15~20분")으로 구간별 사례비 계산
// 5분 이하=1,000원 / 5초과~15이하=3,000원 / 15초과~30이하=5,000원 / 30초과=10,000원
function getRewardByEstimatedTime(estimatedTime) {
  const str = String(estimatedTime || '');
  const nums = str.match(/\d+/g);
  const minutes = nums && nums.length ? Math.max(...nums.map(Number)) : 0;
  if (minutes <= 5) return 1000;
  if (minutes <= 15) return 3000;
  if (minutes <= 30) return 5000;
  return 10000;
}

function getListingReward(listing) {
  return getRewardByEstimatedTime(listing.estimatedTime);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-message');
  msgEl.textContent = message;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 3000);
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.classList.remove('hidden');
}

function hideError(elementId) {
  const el = document.getElementById(elementId);
  el.textContent = '';
  el.classList.add('hidden');
}

// ─── Admin: Add listing ───
function openAddListingModal() {
  if (!isAdmin()) return;
  hideError('add-listing-error');
  const modal = document.getElementById('add-listing-modal');
  if (!modal) return;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  document.getElementById('listing-title').value = '';
  document.getElementById('listing-category').value = '';
  document.getElementById('listing-estimatedTime').value = '';
  document.getElementById('listing-description').value = '';
  document.getElementById('listing-surveyLink').value = '';
  document.getElementById('listing-deadline').value = `${yyyy}-${mm}-${dd}`;
  document.getElementById('listing-maxParticipants').value = '';

  modal.classList.remove('hidden');
}

function closeAddListingModal() {
  const modal = document.getElementById('add-listing-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function createListingFromModal() {
  if (!isAdmin()) return { ok: false, error: '권한이 없습니다.' };

  const title = document.getElementById('listing-title')?.value.trim();
  const category = document.getElementById('listing-category')?.value.trim();
  const estimatedTime = document.getElementById('listing-estimatedTime')?.value.trim();
  const description = document.getElementById('listing-description')?.value.trim();
  const surveyLink = document.getElementById('listing-surveyLink')?.value.trim();
  const deadline = document.getElementById('listing-deadline')?.value;
  const maxParticipantsRaw = document.getElementById('listing-maxParticipants')?.value;
  const maxParticipants = Number(maxParticipantsRaw);

  if (!title) return { ok: false, error: '조사명을 입력하세요.' };
  if (!category) return { ok: false, error: '카테고리를 입력하세요.' };
  if (!estimatedTime) return { ok: false, error: '예상 소요시간을 입력하세요.' };
  if (!description) return { ok: false, error: '설명을 입력하세요.' };
  if (!surveyLink) return { ok: false, error: '설문 링크를 입력하세요.' };
  if (!deadline) return { ok: false, error: '마감일을 입력하세요.' };
  if (!Number.isFinite(maxParticipants) || maxParticipants <= 0) return { ok: false, error: '최종 모수(명)를 올바르게 입력하세요.' };

  const current = getStore(KEYS.listings, SAMPLE_LISTINGS) || [];
  const maxId = current.reduce((m, l) => Math.max(m, Number(l?.id) || 0), 0);
  const id = maxId + 1;

  const listing = {
    id,
    title,
    description,
    surveyLink,
    deadline,
    status: 'active',
    category,
    estimatedTime,
    maxParticipants,
    currentParticipants: 0,
  };

  setStore(KEYS.listings, [listing, ...current]);
  trackListingCreated(listing);
  return { ok: true, listing };
}

// ─── Profile Panel ───
function openProfilePanel() {
  const panel = document.getElementById('profile-panel');
  if (!panel) return;
  renderProfilePanel();
  panel.classList.add('open');
  document.getElementById('profile-backdrop').classList.remove('hidden');
}

function closeProfilePanel() {
  document.getElementById('profile-panel')?.classList.remove('open');
  document.getElementById('profile-backdrop')?.classList.add('hidden');
}

function withdrawAccount() {
  if (!state.currentUser) return;
  if (!confirm('정말 탈퇴하시겠습니까? 계정과 관련 데이터가 삭제되며 복구할 수 없습니다.')) return;
  const email = state.currentUser.email;
  closeProfilePanel();
  deleteUser(email);
  logout();
  showToast('탈퇴되었습니다.');
}

function renderProfilePanel() {
  const u = findUser(state.currentUser.email) || state.currentUser;
  if (!document.getElementById('profile-form-inner')) return;

  const nameEl  = document.getElementById('panel-user-name-display');
  const emailEl = document.getElementById('panel-user-email-display');
  if (nameEl)  nameEl.textContent  = u.name  || '';
  if (emailEl) emailEl.textContent = u.email || '';

  document.getElementById('profile-name').value       = u.name       || '';
  document.getElementById('profile-birthdate').value  = u.birthdate  || '';
  document.getElementById('profile-gender').value     = u.gender     || '';
  document.getElementById('profile-job').value        = u.job        || '';
}

// ─── Modal ───
function openPayoutModal() {
  const amount = getUnpaidTotal();
  if (amount <= 0) {
    showToast('정산할 금액이 없습니다.');
    return;
  }

  document.getElementById('modal-amount').textContent = amount.toLocaleString();
  document.getElementById('payout-name').value = state.currentUser?.name || '';
  document.getElementById('payout-phone').value = '';
  document.getElementById('payout-bank').value = '';
  document.getElementById('payout-account').value = '';
  hideError('payout-error');
  document.getElementById('payout-modal').classList.remove('hidden');
}

function closePayoutModal() {
  document.getElementById('payout-modal').classList.add('hidden');
}

async function submitPayout() {
  const name = document.getElementById('payout-name').value.trim();
  const phone = document.getElementById('payout-phone').value.trim();
  const bankName = document.getElementById('payout-bank').value.trim();
  const bankAccount = document.getElementById('payout-account').value.trim();

  if (!name) { showError('payout-error', '이름을 입력하세요.'); return; }
  if (!phone) { showError('payout-error', '전화번호를 입력하세요.'); return; }
  if (!bankName) { showError('payout-error', '은행명을 입력하세요.'); return; }
  if (!bankAccount) { showError('payout-error', '계좌번호를 입력하세요.'); return; }

  hideError('payout-error');
  const btn = document.getElementById('btn-submit-payout');
  btn.disabled = true;
  btn.textContent = '처리 중...';

  const result = addPayout(name, phone, bankName, bankAccount);
  if (!result.ok) {
    showError('payout-error', result.error);
    btn.disabled = false;
    btn.textContent = '정산 요청하기';
    return;
  }

  await sendPayoutEmail(result.payout);

  btn.disabled = false;
  btn.textContent = '정산 요청하기';
  closePayoutModal();
  showToast('정산 요청이 접수되었습니다!');
  renderSettlement();
}

// ─── Event Listeners ───
function bindEvents() {
  // Login
  document.getElementById('btn-login').addEventListener('click', () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    hideError('login-error');
    if (!email || !password) {
      showError('login-error', '이메일과 비밀번호를 입력하세요.');
      return;
    }
    const result = login(email, password);
    if (result.ok) {
      showView('app');
    } else {
      showError('login-error', result.error);
    }
  });

  // Enter key on login fields
  ['login-email', 'login-password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btn-login').click();
    });
  });

  // 인증번호 받기
  document.getElementById('btn-send-verify').addEventListener('click', () => {
    const phone = document.getElementById('reg-phone').value.trim();
    hideError('register-error');
    const result = sendVerificationCode(phone);
    if (!result.ok) {
      showError('register-error', result.error);
      return;
    }
    document.getElementById('verify-code-wrap').classList.remove('hidden');
    document.getElementById('reg-verify-code').value = '';
    document.getElementById('reg-verify-code').focus();
    const hint = document.getElementById('verify-hint');
    hint.classList.remove('hidden');
    hint.textContent = `데모: 인증번호 [ ${result.code} ] 를 입력하세요. (실제 서비스에서는 SMS로 발송됩니다.)`;
    hint.classList.add('text-accent-lt');
    showToast('인증번호가 발송되었습니다.');
  });

  // Register
  document.getElementById('btn-register').addEventListener('click', () => {
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const verificationCode = document.getElementById('reg-verify-code').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-password-confirm').value;

    hideError('register-error');
    if (!name || !phone || !verificationCode || !email || !password || !confirm) {
      showError('register-error', '전화번호 인증을 포함해 모든 필드를 입력하세요.');
      return;
    }
    if (password !== confirm) {
      showError('register-error', '비밀번호가 일치하지 않습니다.');
      return;
    }
    const result = register(name, email, password, phone, verificationCode);
    if (result.ok) {
      login(email, password);
      showView('app');
      showToast('회원가입이 완료되었습니다!');
    } else {
      showError('register-error', result.error);
    }
  });

  // Enter key on register fields
  ['reg-name', 'reg-phone', 'reg-verify-code', 'reg-email', 'reg-password', 'reg-password-confirm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btn-register').click();
    });
  });

  // Toggle login/register
  document.getElementById('show-register').addEventListener('click', () => {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    hideError('login-error');
    document.getElementById('verify-code-wrap').classList.add('hidden');
    document.getElementById('verify-hint').classList.add('hidden');
  });

  document.getElementById('show-login').addEventListener('click', () => {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    hideError('register-error');
  });

  // Profile panel
  document.getElementById('btn-profile').addEventListener('click', openProfilePanel);
  document.getElementById('btn-close-profile').addEventListener('click', closeProfilePanel);
  document.getElementById('profile-backdrop').addEventListener('click', closeProfilePanel);

  document.getElementById('btn-save-profile').addEventListener('click', () => {
    const name      = document.getElementById('profile-name').value.trim();
    const birthdate = document.getElementById('profile-birthdate').value.trim();
    const gender    = document.getElementById('profile-gender').value;
    const job       = document.getElementById('profile-job').value.trim();
    if (!name) { showToast('이름을 입력하세요.'); return; }
    saveProfile(name, birthdate, gender, job);
    showToast('프로필이 저장되었습니다!');
    closeProfilePanel();
  });

  document.getElementById('btn-withdraw').addEventListener('click', withdrawAccount);

  // Logout
  document.getElementById('btn-logout').addEventListener('click', logout);

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Search
  document.getElementById('search-input').addEventListener('input', e => {
    state.searchQuery = e.target.value;
    renderListings();
  });

  // Payout modal (정산받기 버튼 제거됨 — 모달은 필요 시 다른 진입점에서 사용 가능)
  document.getElementById('btn-close-modal').addEventListener('click', closePayoutModal);
  document.getElementById('btn-submit-payout').addEventListener('click', submitPayout);

  document.getElementById('payout-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closePayoutModal();
  });

  // Admin: Add listing
  const btnAdd = document.getElementById('btn-add-listing');
  if (btnAdd) btnAdd.addEventListener('click', openAddListingModal);
  const btnCloseAdd = document.getElementById('btn-close-add-listing');
  if (btnCloseAdd) btnCloseAdd.addEventListener('click', closeAddListingModal);
  const btnSubmitAdd = document.getElementById('btn-submit-add-listing');
  if (btnSubmitAdd) btnSubmitAdd.addEventListener('click', () => {
    hideError('add-listing-error');
    const result = createListingFromModal();
    if (!result.ok) {
      showError('add-listing-error', result.error);
      return;
    }
    closeAddListingModal();
    renderListings();
    showToast('조사가 추가되었습니다.');
  });
  const addModal = document.getElementById('add-listing-modal');
  if (addModal) addModal.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAddListingModal();
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closePayoutModal();
      closeProfilePanel();
      closeAddListingModal();
    }
  });
}

// ─── Init ───
function init() {
  initData();
  bindEvents();

  if (checkSession()) {
    showView('app');
  } else {
    showView('login');
  }
}

document.addEventListener('DOMContentLoaded', init);
