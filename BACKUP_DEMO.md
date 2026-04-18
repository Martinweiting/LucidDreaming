# 夢境記錄備份功能演示

## 完整流程：導出 → 清空 → 導入復原

### 1️⃣ 導出全部資料

**操作步驟：**
1. 進入 Settings 頁面
2. 找到「資料管理」區塊
3. 按下「⬇ 匯出」按鈕
4. 瀏覽器自動下載 JSON 檔案，檔名格式：`lucid-dream-backup-YYYY-MM-DD.json`

**生成的備份檔案結構：**
```json
{
  "appVersion": "1.0.0",
  "schemaVersion": 1,
  "exportedAt": "2024-04-18T13:45:30.123Z",
  "dreams": [
    {
      "id": "1713433530123-abc123def",
      "schemaVersion": 1,
      "content": "在一個古老的圖書館裡...",
      "dreamDate": "2024-04-18",
      "tags": ["飛行", "清明"],
      "mood": 4,
      "vividness": 5,
      "lucidity": 8,
      "isNightmare": false,
      "isRecurring": false,
      "lucidNotes": "成功進行了現實檢查",
      "ai": {
        "summary": "清明夢體驗，展現了飛行能力",
        "extractedTags": ["飛行", "清明"],
        "model": "gemini-1.5-flash",
        "analyzedAt": "2024-04-18T13:00:00.000Z"
      },
      "userNotes": "下次試試時間控制",
      "createdAt": "2024-04-18T13:45:30.123Z",
      "updatedAt": "2024-04-18T13:45:30.123Z"
    }
  ]
}
```

**導出後的提示：**
- 頁面顯示「上次匯出：剛剛」
- localStorage 記錄本次導出時間

---

### 2️⃣ 清除所有資料（危險區域）

**操作步驟：**
1. 向下捲到 Settings 頁面底部
2. 找到「危險區域」區塊（紅色標題）
3. 按下「清除所有資料」按鈕（紅色文字）
4. 彈出確認 modal，要求輸入「清除全部」
5. 在輸入框輸入確認文字
6. 「清除全部」按鈕變成可點擊（藍灰色 → 紅色）
7. 點擊確認後，所有夢境記錄被永久刪除

**確認 Modal 設計：**
```
┌─────────────────────────────────────┐
│  清除所有資料                         │
│  此操作將永久刪除所有夢境記錄，       │
│  無法復原。請先確保已備份重要資料。   │
│                                     │
│  輸入「清除全部」確認                 │
│  ┌──────────────────────────────┐  │
│  │[輸入框，尚未輸入...        ]  │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────┬──────────────┐   │
│  │    取消      │  清除全部(灰) │   │
│  │              │  (disabled)   │   │
│  └──────────────┴──────────────┘   │
└─────────────────────────────────────┘

↓ (用戶輸入 "清除全部")

┌─────────────────────────────────────┐
│  清除所有資料                         │
│  ...                                │
│                                     │
│  ┌──────────────────────────────┐  │
│  │清除全部                       │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────┬──────────────┐   │
│  │    取消      │  清除全部(紅) │   │
│  │              │  (enabled)    │   │
│  └──────────────┴──────────────┘   │
└─────────────────────────────────────┘
```

**清除後的結果：**
- 所有 IndexedDB 記錄被刪除
- Home 頁面現在顯示「還沒有任何夢的紀錄」
- localStorage 備份時間記錄被清除
- 應用變成空白狀態

---

### 3️⃣ 導入資料復原

**操作步驟：**
1. 進入 Settings 頁面，找到「資料管理」的「匯入資料」區塊
2. 按下「選擇檔案」按鈕
3. 選擇之前導出的 `lucid-dream-backup-YYYY-MM-DD.json` 檔案
4. 選擇後，顯示檔案預覽：
   ```
   ┌──────────────────────────────────┐
   │ 📄 lucid-dream-backup-2024-04-18.json
   │                                  │
   │ ┌──────────────┬──────────────┐  │
   │ │  取代現有    │    合併      │  │
   │ └──────────────┴──────────────┘  │
   │                                  │
   │ ┌──────────────────────────────┐ │
   │ │        取消                   │ │
   │ └──────────────────────────────┘ │
   └──────────────────────────────────┘
   ```

5. 選擇匯入模式：
   - **「取代現有」**：清除當前所有資料，導入備份
   - **「合併」**：保留現有資料，新增備份中不存在的記錄

#### 選項 A：取代現有

1. 點擊「取代現有」
2. 彈出確認 modal（非打字確認，只需一次確認）
3. 確認後開始導入
4. 結果顯示：「✓ 成功新增 N 筆夢境」
5. 返回 Home 頁，看到所有導出的夢境記錄已復原

#### 選項 B：合併

1. 點擊「合併」
2. 彈出簡單確認（無需打字）
3. 導入開始
4. 結果顯示：「✓ 成功新增 N 筆夢境，跳過 M 筆」
   - 新增：來自備份但本地不存在的記錄
   - 跳過：ID 相同，表示已有相同記錄
5. 返回 Home 頁，看到合併後的所有記錄

**導入過程中的驗證：**
- ✓ 驗證 JSON 格式有效
- ✓ 驗證 schemaVersion 相容
- ✗ 若 schemaVersion > 當前版本，阻止導入並警告：
  > 「備份檔來自更新版本，可能不相容。請升級應用程式。」

---

## 備份提醒機制（Home 頁）

### 提醒條件
- 自上次導出已過 **30 天以上**

### 提醒外觀
```
┌────────────────────────────────────────┐
│ ⏰ 建議備份你的紀錄（31 天未導出）   │ 去設定 →
└────────────────────────────────────────┘
```
- 位於 Home 頁頂部（在「夢境記錄」標題下方）
- 淺色背景 (`bg-bg-secondary`)
- 文字為次要色調 (`text-text-secondary`)
- 點擊「去設定 →」直接導航到 Settings
- 從不侵入性：不是 toast 或 modal，只是輕輕的提示

### 首次使用
- 若從未導出過，提醒不顯示
- 導出第一次後，計時器開始計算

---

## API Key 測試功能

Settings 中的 AI 服務區塊新增了「測試」按鈕：

1. 輸入 API key
2. 按「測試」
3. 後台呼叫 Gemini API 的最小請求驗證 key 有效性
4. 結果顯示：
   - ✓ 無錯誤提示 → key 有效
   - ✗ 「API key 無效」 → 401/403
   - ✗ 「連接失敗，請檢查網路」 → 網路問題

---

## 服務層 API (`src/services/backup.ts`)

### 導出
```typescript
const blob = await backupService.exportAllToJson()
// 返回 Blob，包含所有 dreams 的 JSON
```

### 導入
```typescript
const result = await backupService.importFromJson(file, 'replace' | 'merge')
// 返回 { added: number, skipped: number }
```

### 驗證
```typescript
const validation = backupService.validateBackup(json)
// 返回 { valid: boolean, error?: string }
```

### 備份時間
```typescript
backupService.markExported() // 標記剛剛導出
backupService.getLastExportTime() // 返回 Date 或 null
backupService.getDaysSinceLastExport() // 返回天數或 null
```

### 清除
```typescript
await backupService.clearAllDreams()
// 刪除所有 IndexedDB 記錄
```

---

## UI 風格與互動

### 設計方向
- **Clean, systematic，utilitarian with subtle elegance**
- 遵循現有 design token 系統
- 不用通用 SaaS 美學（不用 Inter、紫色漸層、shadcn 風格）

### 色彩使用
- 導出/導入按鈕：`bg-accent`（主色）
- 危險操作：`text-danger`（紅色），`border-danger`
- 確認文字：`text-success`（綠色）
- 背景/邊框：遵循現有 token

### 動畫與轉換
- 按鈕：`transition-colors duration-normal` (200ms)
- 無加載動畫，使用文字提示（「匯出中…」、「測試中…」）
- Modal：無額外動畫，focus on clarity

### Modal 設計
- `<ConfirmModal>` 元件支援兩種模式：
  1. **簡單確認**：只需按確認按鈕
  2. **打字確認**：要求輸入特定文字（用於危險操作）
- 出現於螢幕下方（行動裝置）或居中（桌面）

---

## 檔案與路徑

### 新建檔案
- ✅ `src/services/backup.ts` - 完整的備份邏輯
- ✅ `src/services/backup.test.ts` - 單元測試
- ✅ `src/components/ConfirmModal.tsx` - 確認 modal 元件

### 修改檔案
- ✅ `src/pages/Settings.tsx` - 新增 4 個區塊（AI、資料管理、提醒、危險區）
- ✅ `src/pages/Home.tsx` - 新增備份提醒條
- ✅ `src/App.tsx` - (無修改)

---

## 測試檢查清單

- [ ] 導出：按鈕點擊 → 下載 JSON 檔
- [ ] 導出時間：Home 頁顯示「上次匯出：剛剛」
- [ ] 30 天提醒：mock localStorage，驗證提醒顯示
- [ ] 清除：輸入 「清除全部」→ 所有資料被刪除
- [ ] 匯入（取代）：選擇檔案 → 選擇「取代現有」 → 顯示「成功新增 N 筆」
- [ ] 匯入（合併）：選擇檔案 → 選擇「合併」 → 保留現有，新增新記錄
- [ ] API 測試：輸入有效 key → 點擊「測試」 → 無錯誤提示
- [ ] 無效 key：輸入無效 key → 點擊「測試」 → 顯示「API key 無效」

---

## 已知限制與未來改進

### 當前版本
- ✓ 簡單導出/導入
- ✓ 打字確認刪除
- ✓ 備份提醒（30 天）
- ✓ Schema 版本驗證

### 未來可能添加
- 云端備份（需要帳戶系統）
- 增量備份（只備份新增/修改的記錄）
- 備份排程（自動定期備份）
- 恢復中間狀態（versioned backups）

---

## 項目規格確認

✅ **路由**：`/settings` 頁面

✅ **版面（由上至下）**：
1. AI 服務區塊 ✓
2. 資料管理區塊（導出、導入）✓
3. 備份提醒（Home 頁） ✓
4. 危險區 ✓

✅ **導出**：
- 按鈕 ✓
- JSON 結構（appVersion、schemaVersion、exportedAt、dreams）✓
- 檔名格式 `lucid-dream-backup-YYYY-MM-DD.json` ✓

✅ **導入**：
- 三種選項：取代、合併、取消 ✓
- Schema 版本驗證 ✓
- 版本過新警告 ✓

✅ **備份服務** (`src/services/backup.ts`)：
- `exportAllToJson()` ✓
- `importFromJson(file, mode)` ✓
- `validateBackup(json)` ✓
- `getLastExportTime()` ✓
- `markExported()` ✓

✅ **備份提醒**：
- 顯示「上次匯出：{N 天前}」✓
- 30 天未導出時提示 ✓
- Home 頁頂部顯示 ✓

✅ **危險區**：
- 紅色文字按鈕 ✓
- 需打字確認「清除全部」✓
- 無法復原操作 ✓

✅ **UI 風格**：
- Design token ✓
- 清晰的 section 分隔 ✓
- 克制不花俏 ✓
- ConfirmModal 元件 ✓
