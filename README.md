# 1879 Latte Catalog Viewer

pptx 카탈로그(`1879_라떼카탈로그.pptx`)에서 추출한 이미지 21장 + 영상 5개를
기반으로 만든 Next.js 슬라이드 뷰어입니다. 좌측 사이드바 목차 + 우측 메인
뷰어 + 이전/다음 네비게이션 구조이며, 음료 5종 × 4가지 뷰(Catalog / Catalog
KR / Food Pairing / Intro Video)로 구성돼 있습니다.

<<<<<<< HEAD

## 프로젝트 구조

```
app/
  layout.tsx          # 전체 레이아웃, 메타데이터, 뷰포트 설정
  page.tsx            # /catalog로 리다이렉트
  catalog/page.tsx    # 뷰어 페이지 진입점
components/
  SlideViewer.tsx     # 사이드바 목차 + 메인 뷰어 (핵심 컴포넌트)
  Lightbox.tsx         # "크게 보기" 확대/드래그 팝업
data/
  slides.ts           # ★ 슬라이드 목록 데이터 — 콘텐츠 수정은 대부분 여기서 끝남
public/media/
  image1.png ~ image21.png   # pptx에서 추출한 이미지
  media1.mp4 ~ media5.mp4    # pptx에서 추출한 영상 (음료별 1개)
```

---

## 이 뷰어는 어떻게 동작하나

이 프로젝트를 처음 보는 사람을 위한 개념 설명입니다. 코드를 몰라도 이해할
수 있게 썼습니다.

### 1. 슬라이드는 그냥 "번호가 붙은 데이터 목록"이다

`data/slides.ts`를 열어보면 이렇게 생긴 항목이 21개 나열돼 있습니다.

```ts
{ id: 6, title: "Roasted Sweet Potato Latte — Catalog", category: "Roasted Sweet Potato Latte", type: "image", src: "/media/image6.png" }
```

- **`id`** — 이 슬라이드의 "번호표"입니다. 1번부터 21번까지 순서대로 붙어 있습니다.
- **`src`** — 이 번호가 실제로 어떤 파일을 보여줄지 알려주는 "주소"입니다.
- **`category`** — 어떤 음료에 속하는지 (사이드바에서 그룹핑할 때 씁니다).
- **`type`** — `image`면 사진, `video`면 영상입니다.

PPT의 "슬라이드"를 자바스크립트 배열의 "항목 하나"로 옮겨놓은 것뿐입니다.

### 2. 화면은 "지금 몇 번을 보고 있나"만 기억한다

전체 21장을 한꺼번에 그리는 게 아니라, "현재 몇 번(`id`)을 보고 있는지"
숫자 하나만 기억합니다. 이전/다음 버튼을 누르면 이 숫자만 바뀌고, 화면은
그 번호에 해당하는 데이터를 데이터 목록에서 찾아 다시 그립니다. 책갈피를
옮기는 것과 비슷합니다 — 책 내용은 그대로, 책갈피 위치만 바뀌는 것.

### 3. 사이드바 목차는 이 데이터를 음료별로 묶어서 보여줄 뿐

21개 항목을 `category` 값 기준으로 묶어서 목차를 자동으로 만듭니다.
데이터 목록에 항목을 추가/삭제하면 목차도 그에 맞춰 자동으로 바뀝니다.

### 4. 이미지/영상 전환은 "타입 보고 이거 아니면 저거"

`type`이 `"image"`면 이미지 태그로, `"video"`면 영상 태그로 보여주는
간단한 조건 분기입니다. 복잡한 트릭이 아니라 딱 이 정도입니다.

**한 문장 요약**: PPT 슬라이드를 번호 붙은 데이터 배열로 바꾸고, 지금 몇 번을
보고 있는지 숫자 하나로 관리하면서, 그 번호에 맞는 파일을 화면에 갈아끼우는
방식입니다.

### 이미지는 어떻게 뷰어에 들어왔나

`.pptx` 파일은 사실 zip 압축 파일입니다. 압축을 풀면 `ppt/media/` 폴더
안에 슬라이드에 들어간 이미지·영상 원본이 `image1.png`, `image2.png`...
형태로 그대로 저장돼 있습니다. 어떤 슬라이드가 어떤 파일을 쓰는지는
`slide{N}.xml.rels`라는 관계 파일에 적혀 있어서, 그걸 보고 매핑을
확인한 뒤 `public/media/` 폴더로 그대로 복사해 넣었습니다. 별도의 변환이나
리사이즈는 하지 않았습니다 (단, 원본 해상도가 낮은 세로 이미지는 화질
보정을 한 번 거쳤습니다 — 아래 참고).

---

## 이미지 교체하기 (id로 찾아서 바꾸기)

### 방법 1 — 파일명 그대로 덮어쓰기 (가장 쉬움, 코드 수정 불필요)

1. 바꾸고 싶은 슬라이드의 **번호(id)**를 정합니다.
2. 아래 표에서 그 번호가 어떤 파일을 쓰는지 찾습니다.
3. `public/media/` 폴더에서 **같은 파일명으로** 새 이미지를 덮어씁니다.

코드(`data/slides.ts`)는 이미 "이 번호는 이 파일을 본다"라고 적혀 있으므로,
파일 내용만 바꾸면 자동으로 새 이미지가 반영됩니다.

| id | 음료 | 뷰 | 파일 |
|----|------|-----|------|
| 1  | (표지) | Cover | `image1.png` |
| 2  | Matcha Latte | Catalog | `image2.png` |
| 3  | Matcha Latte | Catalog (KR) | `image3.png` |
| 4  | Matcha Latte | Food Pairing | `image4.png` |
| 5  | Matcha Latte | Intro Video | `media1.mp4` (포스터: `image5.png`) |
| 6  | Roasted Sweet Potato Latte | Catalog | `image6.png` |
| 7  | Roasted Sweet Potato Latte | Catalog (KR) | `image7.png` |
| 8  | Roasted Sweet Potato Latte | Food Pairing | `image8.png` |
| 9  | Roasted Sweet Potato Latte | Intro Video | `media2.mp4` (포스터: `image9.png`) |
| 10 | Roasted Corn Latte | Catalog | `image10.png` |
| 11 | Roasted Corn Latte | Catalog (KR) | `image11.png` |
| 12 | Roasted Corn Latte | Food Pairing | `image12.png` |
| 13 | Roasted Corn Latte | Intro Video | `media3.mp4` (포스터: `image13.png`) |
| 14 | Purple Sweet Potato Latte | Catalog | `image14.png` |
| 15 | Purple Sweet Potato Latte | Catalog (KR) | `image15.png` |
| 16 | Purple Sweet Potato Latte | Food Pairing | `image16.png` |
| 17 | Purple Sweet Potato Latte | Intro Video | `media4.mp4` (포스터: `image17.png`) |
| 18 | Injeolmi Ssuk Latte | Catalog | `image18.png` |
| 19 | Injeolmi Ssuk Latte | Catalog (KR) | `image19.png` |
| 20 | Injeolmi Ssuk Latte | Food Pairing | `image20.png` |
| 21 | Injeolmi Ssuk Latte | Intro Video | `media5.mp4` (포스터: `image21.png`) |

**예시**: "6번(고구마 라떼 영문 카탈로그)을 바꾸고 싶다"
→ 표에서 6번은 `image6.png` → `public/media/image6.png`를 새 이미지로 덮어쓰기.

### 방법 2 — 파일명을 다르게 하고 싶을 때

새 파일을 다른 이름(예: `sweet-potato-new.png`)으로 `public/media/`에
넣고, `data/slides.ts`에서 해당 `id`의 `src` 값만 고쳐주면 됩니다.

```ts
{ id: 6, ..., src: "/media/sweet-potato-new.png" }
```

### 이미지 교체 시 주의할 점

- **형식**: PNG 권장 (JPG로 바꾸면 화질이 다소 떨어질 수 있음)
- **비율**: 원본과 가로세로 비율이 많이 다르면 여백이 생기거나 잘려 보일 수 있음
- **해상도**: 너무 작은 이미지는 화면에서 흐리게 보임 (가로 1000px 이상 권장)

파일만 바꾸고 로컬에서 `npm run dev`로 바로 확인 가능합니다. 배포된 상태라면
다시 빌드(`npm run build`)해서 올려야 반영됩니다.

---

## 커스터마이징

- **음료명/카테고리명 변경**: `data/slides.ts`의 `category` 값을 바꾸면
  사이드바 목차와 상단 음료명, 퀵 탭 라벨까지 전부 자동으로 바뀝니다.
- **음료별 강조 색상**: `data/slides.ts`의 `categoryColors` 객체에서
  음료별 hex 코드를 바꾸면 사이드바 활성 항목, 진행바, 카운터 숫자,
  버튼 hover 색까지 전부 그 색으로 바뀝니다.
- **슬라이드 제목/순서**: `data/slides.ts` 배열 순서와 `title` 값을
  그대로 수정하면 됩니다.
- **팔레트/폰트**: `app/globals.css`의 `:root` 변수(`--cream`, `--red` 등)와
  `components/SlideViewer.tsx`의 `<style jsx>` 안 font-family를 CSF/1879
  브랜드 톤(베이지 + 레드 `#a8321f`, DM Serif Display / Cormorant Garamond)에
  맞춰뒀습니다.
- **구글 폰트 적용**: 이 프로젝트를 만든 개발 환경은 외부 폰트 CDN 접근이
  막혀 있어서 빌드 시 `fonts.googleapis.com` 호출을 뺐습니다. 실제 배포
  환경(네트워크 제약 없는 곳)에서는 `app/layout.tsx`의 `<head>`에 아래를
  다시 넣으면 폰트가 정상 로드됩니다:

  ```tsx
  <head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Noto+Sans+KR:wght@300;400;500;700&display=swap"
      rel="stylesheet"
    />
  </head>
  ```

## 영상 재생 & 용량

각 음료의 마지막 뷰(Intro Video)는 `type: "video"`로 되어 있고, 원본
pptx에 같이 저장돼 있던 프레임 이미지를 `poster`(재생 전 미리보기)로
활용합니다. `<video controls>` 태그를 그대로 쓰기 때문에 브라우저 기본
컨트롤(재생/일시정지/볼륨/전체화면)이 다 지원됩니다. 원본 영상은
1080p에 파일당 37MB 정도였는데, ffmpeg로 화질 손실 거의 없이
파일당 3~6MB 수준으로 재인코딩했습니다.

## 크게 보기 (라이트박스)

스테이지 우상단의 확대 아이콘을 누르면 이미지/영상이 전체화면 팝업으로
커집니다. 이미지는 하단 중앙의 −/％/+ 버튼으로 100~300% 확대·축소할 수
있고, 확대된 상태에서는 마우스/터치로 드래그해서 위치를 옮길 수 있습니다.

## 모바일

900px 이하 화면에서는 사이드바가 슬라이드인 방식으로 바뀌고, 화면 하단
컨트롤이 세로로 재배치됩니다. 좌우 스와이프로도 슬라이드를 넘길 수 있고
(영상 슬라이드는 재생바와 겹치지 않도록 제외), 노치/홈 인디케이터가 있는
기기에서도 버튼이 가려지지 않도록 안전 영역(safe-area)을 적용했습니다.
