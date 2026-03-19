# Proby 설문 패널

## Git / 배포 저장소 (중요)

이 프로젝트 변경분은 **`https://github.com/churryboy/panel.git`** 에만 푸시합니다.

- **`https://github.com/churryboy/casestudy.git`에는 이 폴더 작업을 올리지 않습니다.** (다른 레포와 혼동 금지)
- `panel` 저장소를 별도로 클론한 뒤, 이 폴더 내용을 동기화하여 커밋·푸시하세요.

---

## ERR_ACCESS_DENIED / 스크립트가 안 뜰 때

브라우저는 **로컬 파일(`file://`)로 열면** 보안상 `app.js`, `styles.css` 같은 리소스 로딩을 막을 수 있습니다.  
**반드시 로컬 서버로 띄워서** 접속하세요.

### 방법 1 (권장)

```bash
cd "40. 신사업팀 (바이브코딩)/설문패널"
npm install
npm run build:css
npm run serve
```

브라우저에서 표시된 주소(예: http://localhost:3000)로 접속합니다.

### 방법 2

```bash
cd "40. 신사업팀 (바이브코딩)/설문패널"
npm run build:css
python3 -m http.server 8765
```

이후 http://localhost:8765 로 접속합니다.

---

## Tailwind CSS (프로덕션용)

CDN 대신 빌드된 CSS를 쓰면 콘솔 경고가 사라지고 프로덕션에 적합합니다.

- **최초 1회·CSS 수정 후:**  
  `npm install` → `npm run build:css`  
- 생성된 파일: `dist/tailwind.css` (이 파일을 그대로 배포하면 됩니다)
