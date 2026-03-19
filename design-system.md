# Proby Landing Page — Design System
> `index.html` + `styles.css` + `color.md` 기준으로 1:1 추출한 실제 적용 규칙  
> 마지막 동기화: 2026-03-11

---

## 1. 색상 토큰 (Color Tokens)

CSS 변수로 정의. 소스: `styles.css` `:root`.

| CSS 변수 | Hex | Color.md 토큰 | 용도 |
|---|---|---|---|
| `--bg` | `#0A0A0B` | Black/2 | 페이지 배경 (`body`) |
| `--surface` | `#111114` | Black/5 | elevated surface, xarrow-badge 배경 |
| `--card` | `#19191E` | Black/10 | 카드·glass 기본 배경 |
| `--border` | `#25252D` | Black/20 | divider, blob 배경 |
| `--accent-dim` | `#1E3050` | Dark Navy/30 | blob·badge·muted 레이어 |
| `--accent` | `#28406E` | Dark Navy/40 | 버튼(Primary), mic 배경 |
| `--accent-hi` | `#4168AF` | Dark Navy/60 | hover 강조, 노드 dot, xarrow icon |
| `--accent-text` | `#7DA3E0` | Dark Navy/80 | section-label, chip 텍스트, icon |
| `--accent-lt` | `#A3C2EF` | Dark Navy/90 | 그라디언트 텍스트 끝, ghost CTA 색상 |

### 색상 사용 원칙
- **배경/서페이스** → Black 시리즈 (neutral cool dark)
- **액센트/인터랙티브** → Dark Navy 시리즈 (ocean navy)
- 밝은 Purple·Pink 계열 없음 — Dark Navy 단색 팔레트 유지
- 색상 투명도는 `rgba()` 또는 Tailwind `opacity` 유틸리티로만 조절

---

## 2. 타이포그래피 (Typography)

### 폰트 패밀리
| 역할 | 폰트 | 적용 방식 |
|---|---|---|
| 디스플레이 (기본 전체) | **Pretendard** | CDN `cdn.jsdelivr.net`, `class="font-display"` (`body` 적용) |
| 아이콘 | **Material Symbols Outlined** | Google Fonts, `variable` axes (weight 100–700, fill 0–1) |

Tailwind 설정: `body class="font-display text-white antialiased overflow-x-hidden"`

### 타이포그래피 스케일 (실제 사용)

| 역할 | 클래스/스타일 | 크기 | 굵기 |
|---|---|---|---|
| Hero H1 | `text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight` | 36–60px | 900 |
| Section H2 | `text-4xl md:text-5xl font-black leading-tight` | 36–48px | 900 |
| Section Label | `.section-label` | `0.7rem` | 700 |
| Body / Sub | `text-lg md:text-xl leading-relaxed` | 18–20px | 400 |
| Body Muted | `text-white/60`, `text-white/45`, `text-white/40` | 상황별 | 400–500 |
| Stat Number | `.stat-num` | `clamp(2.5rem, 6vw, 5rem)` | 900 |
| Card Label | `.wf2-card-label` | `0.82rem` | 700 |
| Card Desc | `.wf2-card-desc` | `0.7rem` | 500 |
| Section Label | `.section-label` | `0.7rem`, `letter-spacing: 0.2em`, uppercase | 700 |
| Badge / Tag | `.wf2-tag`, `.pricing-tier-label` | `0.6–0.7rem` | 800–900 |
| Footnote | `text-xs text-white/30` | 12px | 400 |

### 그라디언트 텍스트
```css
.grad-text {
  background: linear-gradient(135deg, #ffffff 20%, var(--accent-lt) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```
적용: 히어로 H1 첫째 줄, 섹션 H2 타이틀 전반.

---

## 3. 레이아웃 (Layout)

| 속성 | 값 |
|---|---|
| 최대 너비 | `max-w-[1600px] mx-auto` |
| 수평 패딩 | `px-6 md:px-16` |
| 섹션 수직 패딩 | `py-24` (기본) / `py-28` (Pricing) / `py-32` (CTA) / `py-20` (Benchmark) |

---

## 4. 컴포넌트

### 4-1. Header
```
고정(fixed top-0), z-50
배경: rgba(10,10,11, 0.7) + backdrop-filter: blur(20px)
하단 보더: 1px solid rgba(21,34,56, 0.8)
우측: Ghost 버튼 "Receive a sample" (border: rgba(65,104,175,0.35), color: --accent-lt)
```

### 4-2. Glass Card
```css
.glass {
  background: rgba(25,25,30, 0.7);      /* --card */
  border: 1px solid rgba(21,34,56, 0.9);
  backdrop-filter: blur(20px);
}
```
적용: Benchmark 섹션 차트 래퍼.

### 4-3. Badge (Hero 배지)
```css
.badge {
  background: rgba(30,48,80, 0.5);       /* --accent-dim */
  border: 1px solid rgba(65,104,175, 0.25);
  backdrop-filter: blur(8px);
}
```
적용: 히어로 배지 (`inline-flex`, `rounded-full`, `px-4 py-2`).

### 4-4. Section Label
```css
.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--accent-text);   /* #7DA3E0 */
  text-transform: uppercase;
}
```

### 4-5. Divider
```css
.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
}
```

### 4-6. Blob (배경 글로우)
```css
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
  pointer-events: none;
}
```
실제 색상: `#1E3050` (Dark Navy/30), `#25252D` (Black/20), `#19191E` (Black/10) — 불투명도 0.12–0.20.

---

## 5. 버튼 (Buttons)

### Primary (Solid)
```css
.btn-primary {
  background: var(--accent);                     /* #28406E */
  box-shadow: 0 0 32px rgba(30,48,80, 0.5);
  transition: box-shadow 0.2s, background 0.2s;
}
.btn-primary:hover {
  background: var(--accent-hi);                  /* #4168AF */
  box-shadow: 0 0 40px rgba(40,64,110, 0.45);
}
```
형태: `rounded-full`, `px-10 py-4` 또는 `w-56 py-4`, `font-bold text-white text-sm`.

### Ghost (Outline)
```
border: 1px solid rgba(65,104,175, 0.35)
color: var(--accent-lt)    /* #A3C2EF */
background: transparent
```
형태: `rounded-full`, `text-sm font-bold`.

### Pricing CTA — Ghost
```css
.pricing-cta-ghost {
  background: rgba(65,104,175, 0.12);
  color: var(--accent-lt);
  border: 1px solid rgba(65,104,175, 0.3);
  border-radius: 0.75rem;
}
.pricing-cta-ghost:hover {
  background: rgba(65,104,175, 0.22);
  border-color: rgba(65,104,175, 0.55);
}
```

### Pricing CTA — Solid
```css
.pricing-cta-solid {
  background: var(--accent);
  color: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 0 28px rgba(65,104,175, 0.25);
}
.pricing-cta-solid:hover {
  background: var(--accent-hi);
  box-shadow: 0 0 40px rgba(65,104,175, 0.4);
}
```

---

## 6. 모달

### Interview Modal (iframe 기반)
```css
#modal-box {
  width: min(480px, calc(100vw - 32px));
  height: min(780px, calc(100dvh - 48px));
  border-radius: 24px;
  border: 1px solid rgba(65,104,175, 0.25);
  box-shadow: 0 0 80px rgba(30,48,80, 0.5), 0 0 0 1px rgba(255,255,255, 0.04);
  animation: modal-in 0.35s cubic-bezier(.16,1,.3,1) both;
}
/* backdrop */
background: rgba(5,5,6, 0.85);
backdrop-filter: blur(12px);
```

### Sample Form Modal
```css
.sf-box {
  background: #0f1117;
  border: 1px solid rgba(255,255,255, 0.08);
  border-radius: 1.25rem;
  max-width: 540px;
  max-height: 90vh;
  padding: 2.5rem;
}
/* backdrop */
background: rgba(0,0,0, 0.7);
backdrop-filter: blur(6px);
```

**Form Input 규칙** (Tailwind forms 플러그인 오버라이드):
```css
.sf-input, .sf-textarea {
  background: rgba(255,255,255, 0.04) !important;
  border: 1px solid rgba(255,255,255, 0.1) !important;
  color: #fff !important;
  border-radius: 0.6rem;
  box-shadow: none !important;
}
.sf-input:focus, .sf-textarea:focus {
  border-color: rgba(65,104,175, 0.6) !important;
  background: rgba(255,255,255, 0.06) !important;
}
```

---

## 7. Pricing 카드

### 기본 카드
```css
.pricing-card {
  background: rgba(25,25,30, 0.85);      /* --card */
  border: 1px solid rgba(40,64,110, 0.3);
  border-radius: 1.25rem;
  padding: 2rem 1.75rem;
  transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
}
.pricing-card:hover {
  border-color: rgba(65,104,175, 0.55);
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(30,48,80, 0.35);
}
```

### Featured(Premium) 카드
```css
.pricing-card-featured {
  border-color: rgba(65,104,175, 0.55);
  background: linear-gradient(160deg, rgba(40,64,110,0.45) 0%, rgba(25,25,30,0.95) 55%);
  box-shadow: 0 0 48px rgba(65,104,175, 0.15), 0 0 0 1px rgba(65,104,175, 0.2);
}
```

### 타이포그래피 내부 규칙
| 요소 | 스타일 |
|---|---|
| Tier label | `0.7rem / 900 / letter-spacing 0.18em / uppercase / --accent-text` |
| Popular badge | `0.6rem / 800 / rounded-full / bg rgba(65,104,175,0.25) / border rgba(65,104,175,0.4)` |
| 가격 숫자 | `3.2rem / 900 / letter-spacing -0.02em / #fff` |
| 통화 기호 | `1.4rem / 700 / rgba(255,255,255,0.6)` |
| 단위 | `0.85rem / 500 / rgba(255,255,255,0.35)` |
| 크레딧 범위 | `0.78rem / 600 / rgba(255,255,255,0.35)` |
| Feature 항목 | `0.82rem / 500 / rgba(255,255,255,0.65)` |

---

## 8. Workflow 2-col 카드

### 래퍼 & 구분선
```css
.wf2-wrap { max-width: 680px; margin: 0 auto; }
.wf2-divider {
  position: absolute; left: 50%;
  background: linear-gradient(to bottom,
    transparent 0%, rgba(65,104,175,.2) 12%,
    rgba(65,104,175,.2) 88%, transparent 100%);
}
```

### 카드 variants
| 클래스 | 배경 | 보더 |
|---|---|---|
| `.wf2-card-proby` | `linear-gradient(135deg, rgba(40,64,110,.4), rgba(25,25,30,.97))` | `rgba(65,104,175,.5)` |
| `.wf2-card-client` | `linear-gradient(135deg, rgba(13,23,40,.7), rgba(25,25,30,.97))` | `rgba(65,104,175,.3)` |
| `.wf2-card-center` | `rgba(30,48,80,.25)` | `rgba(65,104,175,.25)` |

### 태그 (.wf2-tag)
```css
background: rgba(30,48,80,.6);
border: 1px solid rgba(65,104,175,.25);
border-radius: 999px;
padding: 3px 10px;
font-size: .6rem; font-weight: 800;
color: var(--accent-lt);
```

---

## 9. 아이콘 칩 (Icon Chips)

| 클래스 | 배경 | 보더 |
|---|---|---|
| `.icon-chip-1` | `rgba(30,48,80, 0.5)` | `rgba(65,104,175, 0.2)` |
| `.icon-chip-2` | `rgba(21,34,56, 0.6)` | `rgba(40,64,110, 0.25)` |
| `.icon-chip-3` | `rgba(25,25,30, 0.7)` | `rgba(30,48,80, 0.3)` |
| `.icon-chip-4` | `rgba(17,17,20, 0.8)` | `rgba(21,34,56, 0.4)` |

---

## 10. 애니메이션

| 이름 | 정의 | 적용 클래스 |
|---|---|---|
| `pulse-ring` | `scale(1) → scale(1.9)`, opacity 0.5 → 0 | `.pulse-ring` (2.8s), `.pulse-ring-2` (delay 0.9s), `.pulse-ring-3` (delay 1.8s) |
| `fade-up` | `translateY(28px) opacity:0 → 0 opacity:1` | `.fade-up`, `.delay-1~4` (각 0.15s 간격) |
| `modal-in` | `scale(0.92) translateY(20px) → scale(1) translateY(0)` | `#modal-box` (0.35s) |
| `marquee-scroll` | `translateX(0) → translateX(-50%)` | `.marquee-track` (28s linear infinite) |
| `rmc pulse-ring` | 같은 keyframe | `.rmc-ring` (3.2s), `.rmc-ring2` (delay 1.1s) |

**easing:** `cubic-bezier(.16,1,.3,1)` (Spring-ish, 가속도 강조)

**접근성:** `@media (prefers-reduced-motion: reduce)` — 위 모든 애니메이션 `animation: none !important`, transition-duration 0.01ms.

---

## 11. Research Map

| 속성 | 값 |
|---|---|
| Center dot 크기 | `88×88px`, `border-radius: 50%` |
| Center dot 배경 | `linear-gradient(135deg, rgba(30,48,80,.9), rgba(40,64,110,.7))` |
| 연결선 색상 | `rgba(65,104,175,.7)` → `rgba(30,48,80,.08)` (gradient) |
| 노드 dot 크기 | `11×11px`, 색 `--accent-hi` (`#4168AF`) |
| 캔버스 파티클 | `rgba(65,104,175, 0.18–0.50)`, 32개, 중심 → 노드 방향 |
| 캔버스 제어 | `IntersectionObserver`로 뷰포트 진입/이탈 시 RAF on/off |

---

## 12. 마크업 컨벤션

- 섹션 구분: `<!-- ─── SECTION NAME ──...── -->` 패턴
- z-index: 콘텐츠 `z-10`, 헤더 `z-50`, 모달 `z-index: 1000`
- 노이즈 오버레이: `body::before` — SVG fractalNoise, `opacity: 0.5`
- Tailwind `?plugins=forms,container-queries` CDN 로드 (forms 플러그인이 input 기본 스타일 오버라이드 → `.sf-input` 등에 `!important` 필수)
- 이벤트 핸들러: 인라인 `onclick` 없음, 모두 `addEventListener`로 관리
- `data-open-sample` / `data-trigger-section` 데이터 속성으로 컴포넌트 출처 구분 (Mixpanel)

---

## 13. 외부 의존성

| 라이브러리 | 버전/CDN | 역할 |
|---|---|---|
| Tailwind CSS | CDN (latest) + forms, container-queries | 유틸리티 CSS |
| Pretendard | v1.3.9 (jsdelivr), SRI sha384 | 본문 폰트 |
| Material Symbols Outlined | Google Fonts (variable) | 아이콘 |
| Mixpanel | v2-latest (mxpnl CDN) | 이벤트 트래킹 |

---

## 14. 섹션 구성 순서

```
Header (fixed)
  └─ Logo · Ghost CTA

Hero
  └─ Blob bg · Video bg · Badge · H1 · Sub · CTA ×2 · Mic button · Scroll hint

Research Map (canvas + SVG)

Trusted By / Our Clients (white bg, marquee)

Stats (4-column grid)

Benchmark (canvas scatter chart)

Mission / Workflow (2-col card)

Pricing (4-card grid)

CTA Section

Sample Form Modal (overlay)
Interview Modal (iframe overlay)

Footer
```
