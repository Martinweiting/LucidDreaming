# 專案背景

我正在開發一個個人控夢（清明夢）+ 夢境記錄 web app，這是 v1.0，純 web 版本，未來會用 Capacitor 包成 Android app。請所有設計都先以 web 為主，但避免使用無法在 WebView 內運作的 API。

## 工作原則

- 開始任何任務前，請先告訴我你從本文件讀到的關鍵約束有哪些，確認你已載入 context 再動工。
- 一個 session 只做一個 sprint，不要主動展開到下個 sprint 的範圍。
- 完成任務後請明確列出：建立了哪些檔案、修改了哪些檔案、安裝了哪些套件、有哪些尚未完成或無法確定的部分。
- 若需要安裝任何不在「技術棧」清單上的依賴，先告訴我並說明原因，等我同意再裝。

## 技術棧（已定，不要任意更動）

- React 18 + TypeScript + Vite
- Tailwind CSS（不用任何 UI library，不用 shadcn / MUI / Headless UI / Radix）
- Dexie.js（IndexedDB wrapper）
- date-fns（日期處理，不要用 moment 或 dayjs）
- Recharts（圖表）
- React Router v6
- vitest + fake-indexeddb（測試）
- 不用 Redux / Zustand，用 React 內建 state + Context

## TypeScript 規範

- strict mode 必開
- 嚴禁使用 `any`。若真的無法推導，使用 `unknown` 並做 narrow，或寫明確的 interface
- 所有 service 函數的參數與回傳值必須有顯式型別註解
- 共用型別放 `src/types/`，不要散在各 component

## 語言與字型

- UI 與內容皆為繁體中文
- 內文字型：Noto Serif TC，透過 `<link>` 從 Google Fonts 載入
- UI 字型：系統 sans-serif fallback chain
- 所有 UI 文字、錯誤訊息、placeholder、aria-label 都必須是繁體中文，不要中英混雜

## 設計約束

- 夜間情境為主，避免高彩度
- 低亮度環境下要舒適閱讀（次要文字對比度足夠，但不刺眼）
- 視覺氛圍：深、安靜、夜晚
- 嚴禁通用 SaaS 美學：Inter / Roboto 字型、紫色漸層、shadcn 風格、Material Design、emoji 裝飾、漸層按鈕、強發光陰影
- 動畫 duration 一律 ≤ 250ms。頁面切換 200ms、元件互動 150ms 為基準
- 所有顏色、間距、字級、圓角必須使用 design token，**嚴禁** hardcode hex 色碼或 px 數值（除了極少數設計 token 系統內部定義時）
- Tailwind class 統一用語意化命名（`bg-surface`、`text-primary`），不用原生色階（`bg-zinc-900`）

## 可用的 Design Token

以下 token 已經在 `src/design-tokens/tokens.ts` 定義並接入 Tailwind config。**寫任何新元件時必須使用這些 token，不要 hardcode 顏色、間距、字級。**

### 色彩 token（Tailwind class 形式）
- 背景：`bg-bg-primary`、`bg-bg-secondary`、`bg-surface`、`bg-surface-elevated`
- 邊框：`border-border-subtle`、`border-border-default`
- 文字：`text-text-primary`、`text-text-secondary`、`text-text-muted`
- 強調：`bg-accent`、`text-accent`、`border-accent`
- 語意：`text-success`、`text-warning`、`text-danger`、`text-info`
（請依 Sprint 0 實際產出的 token 名稱替換上面清單）

### 字級
{ 列出 Sprint 0 實際定義的字級 class，例如 text-display / text-h1 / text-body / text-caption 等 }

### 間距
{ 列出間距 scale，例如使用 Tailwind 預設或自定義 spacing-1 到 spacing-9 }

### 圓角
{ 列出 radius scale }

### 動畫
{ 列出 duration 與 easing token }

### 開發檢視
所有 token 可在 `/dev/tokens` 路由看到實際視覺。

## 資料儲存

- 主資料：IndexedDB 透過 Dexie.js
- 例外：使用者偏好與 API key 用 localStorage（之後 Capacitor 化會換 Preferences）
- Schema 從第一天就有 `schemaVersion: number` 欄位，每筆記錄都帶
- IndexedDB 不可存 `undefined`：所有 optional 欄位明確存 `null`
- 時間欄位規則：
  - 時刻（createdAt、updatedAt、analyzedAt）：ISO 8601 字串，用 `new Date().toISOString()`
  - 日期（dreamDate）：`YYYY-MM-DD` 字串
  - 不要存 timestamp number、不要存 local time string
- Migration 邏輯集中在 `src/db/migrations.ts`，每次 schema 改動必須提供升版函數

## 資料層 API（已實作）

主要型別定義在 `src/types/dream.ts`：
- `Dream`：完整夢境記錄
- `DreamDraft`：建立時用，省略系統欄位
- `DreamUpdate`：更新時用，所有欄位 optional

所有資料存取必須透過 `src/services/dreamRepo.ts`，不要在 component 直接 import Dexie。

可用方法：
- `dreamRepo.create(draft: DreamDraft): Promise<Dream>`
- `dreamRepo.get(id: string): Promise<Dream | undefined>`
- `dreamRepo.update(id: string, patch: DreamUpdate): Promise<void>`
- `dreamRepo.delete(id: string): Promise<void>`
- `dreamRepo.listAll(): Promise<Dream[]>`
- `dreamRepo.listByDateRange(start: string, end: string): Promise<Dream[]>`
- `dreamRepo.listByTag(tag: string): Promise<Dream[]>`
- `dreamRepo.listIncomplete(): Promise<Dream[]>`
- `dreamRepo.searchFullText(query: string): Promise<Dream[]>`

目前 schemaVersion = 1。

## 服務抽象原則

所有 native / 平台相關功能必須透過 `src/services/` 層封裝，上層 component 不得直接呼叫瀏覽器 API：

- 通知：`services/notifications.ts`
- 檔案讀寫：`services/fileSystem.ts`
- 偏好儲存：`services/preferences.ts`
- AI 呼叫：`services/ai.ts`

未來換 Capacitor 實作時只改 service 內部，不動上層 component。

## AI Service API

`src/services/ai.ts` 提供：
- `analyzeDream(content: string): Promise<AnalysisResult>`

回傳：
```typescript
interface AnalysisResult {
  summary: string;
  extractedTags: string[];
  model: string;
  analyzedAt: string;
}
```

可能拋出的錯誤：
- `MissingApiKeyError`：未設定 API key
- `InvalidApiKeyError`：401/403
- `RateLimitError`：429
- `AnalysisError`：其他

呼叫端必須處理上述錯誤，並提供使用者友善的繁體中文訊息。

## API Key 管理

`src/services/apiKey.ts` 提供：
- `apiKey.get(): string | null`
- `apiKey.set(key: string): void`
- `apiKey.clear(): void`

目前儲存於 localStorage（key: `gemini_api_key`）。Capacitor 化時會換成 Preferences，但介面不變。

## 安全與隱私

- API key 嚴禁寫入程式碼，嚴禁出現在 git history
- `.gitignore` 必須排除 `.env*`、`*.key`、`secrets/`
- 不要把 user 輸入的內容直接拼接到 prompt 字串，使用結構化的 message 物件
- 不要在 console.log 中印出 API key 或完整夢境內容（debug 用 placeholder）

## 響應式與裝置

- 主要目標裝置：Android 手機（之後 Capacitor 化）
- 但 v1 必須在桌面瀏覽器與手機瀏覽器都能正常運作
- 所有 touch target 至少 44x44 px
- 重要表單在鍵盤彈起時不能被遮擋（用 `dvh` 而非 `vh`）

## 元件命名與位置

- pages：`src/pages/PascalCase.tsx`，每個頁面一個檔案
- 共用元件：`src/components/PascalCase.tsx`
- 開發用元件（不會出現在正式路由的 showcase / debug）：`src/components/_dev/`
- hooks：`src/hooks/useCamelCase.ts`
- services：`src/services/camelCase.ts`
- 元件 props 一律定義 interface，命名為 `<ComponentName>Props`

## 已實作的共用元件

以下元件位於 `src/components/`，新頁面盡量重用，不要重新發明：

{ 列出 Sprint 2 實際產出的可重用元件，例如：}
- `<TextArea>`：自動 focus、自動高度
- `<DateField>`：日期選擇

每個元件的 props interface 在檔案頂部，使用前先看 props。

（接續上面清單，新增 Sprint 3 產出的元件）
- `<MoodControl>`：5 段情緒選擇
- `<StarRating>`:可指定上限的星級評分
- `<TagChip>`：標籤 chip，支援 removable 與 dashed 兩種變體
- `<Section>`：可摺疊區塊
- `<ConfirmModal>`：需打字確認的 modal

## 自動儲存模式

DreamDetail 頁建立了標準的自動儲存模式，後續所有編輯場景沿用：
- debounce 800ms
- 失焦立即觸發
- 儲存後在頁面頂部顯示極淡「已儲存」指示，1 秒淡出
- 不使用 toast library

實作位於 `src/hooks/useAutoSave.ts`，新編輯場景請重用。

## 不要做的事

- 不要做使用者帳號、登入、社交功能
- 不要做 streak、成就、徽章等遊戲化
- 不要做多帳號、雲端即時同步
- 不要做錄音功能
- 不要過度動畫
- 不要主動加 toast 通知系統（自動儲存的回饋用更輕的方式）
- 不要主動加 i18n / 多語系框架
- 不要主動加 PWA manifest 與 service worker（之後 Capacitor 處理）
- 不要主動加 analytics、error tracking（Sentry 之類）
- 不要主動加 dark/light mode 切換（本 app 永遠暗色）

## 提交前自我檢查清單

每個 sprint 完成回報前，請主動確認：

1. 沒有 TypeScript error，沒有 `any`
2. 沒有 hardcode 的顏色或 spacing
3. 所有 user-facing 文字是繁體中文
4. 沒有引入未經同意的依賴
5. 新增的 service 函數有型別註解
6. 涉及資料的變更，schema 與 migration 已更新

## Lucid Lab Services

### Reality Check 排程
`src/services/icsExport.ts`：
- `generateRcSchedule(config: RcConfig): RcEvent[]`
- `toIcs(events: RcEvent[] | WbtbPlan): string`
- `downloadIcs(filename: string, content: string): void`

ICS 輸出固定使用 `TZID=Asia/Taipei`。

### Dream Signs 偵測
`src/services/dreamSigns.ts`：
- `detectDreamSigns(dreams: Dream[], windowDays?: number, minOccurrences?: number): DreamSign[]`

預設 windowDays = 30、minOccurrences = 5。

### WBTB 計算
`src/services/wbtb.ts`：
- `calculateWbtb(bedtime: string, totalHours: number): WbtbPlan`

bedtime 格式 `HH:MM`，回傳 plan 內所有時間皆為 `HH:MM`。

## 相似度服務

`src/services/similarity.ts`：
- `findSimilar(dream: Dream, allDreams: Dream[], topN?: number): Dream[]`

採用 tag 集合的 Jaccard 相似度，預設過濾 < 0.2 的結果，預設 topN = 3。

## 備份服務

`src/services/backup.ts`：
- `exportAllToJson(): Promise<Blob>`
- `importFromJson(file: File, mode: 'replace' | 'merge'): Promise<ImportResult>`
- `validateBackup(json: unknown): ValidationResult`
- `getLastExportTime(): Date | null`
- `markExported(): void`

備份檔案結構：
```json
{
  "appVersion": "1.0.0",
  "schemaVersion": 1,
  "exportedAt": "ISO 8601",
  "dreams": [...]
}
```

匯入前必須呼叫 `validateBackup` 驗證。

## Clarifying Questions 政策

只有在以下狀況才問我：
1. 多個合理選項但會導致不同的長期架構
2. 資料會遺失或不可逆的操作

不要為以下事情問：
- 測試策略（有測試就寫，沒必要問「要單元測試還是 E2E」）
- 命名細節（自己選一個，之後 rename 是廉價的）
- UI 微調（按 design token 做即可）
- 「是否要做」（按 prompt 的規格做，不要猜我要不要）

若有疑惑，先做最接近 prompt 規格的版本，在完成報告中說「我做了 X，其他選項是 Y/Z，若不對告訴我」。

## 額外提醒

1. Codex will review your output once you are done.