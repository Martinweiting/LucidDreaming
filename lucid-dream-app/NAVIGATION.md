# 導航系統完整指南

## 概述

已實現完整的導航系統，包含 Navbar 組件和頁面布局包裝器，支持跨頁面導航和返回功能。

## 核心組件

### 1. **Navbar.tsx** (`src/components/Navbar.tsx`)
頂部固定導航欄，提供以下功能：
- **返回按鈕**：顯示在 `showBack={true}` 時，點擊返回上一頁或執行自定義返回邏輯
- **頁面標題**：中央顯示當前頁面名稱
- **右側操作按鈕**：可自定義操作（如儲存按鈕）或默認顯示首頁導航

**Props:**
```typescript
interface NavbarProps {
  title: string;                    // 頁面標題
  showBack?: boolean;               // 是否顯示返回按鈕
  onBackClick?: () => void;         // 自定義返回邏輯
  rightActions?: React.ReactNode;   // 右側操作按鈕
}
```

### 2. **PageLayout.tsx** (`src/components/PageLayout.tsx`)
統一的頁面布局包裝器，組合 Navbar 和內容區域。

**Props:**
```typescript
interface PageLayoutProps {
  title: string;
  showBack?: boolean;
  onBackClick?: () => void;
  rightActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;  // 自定義 main 區域樣式
}
```

## 已更新的頁面

### ✅ Home （首頁）
- 保持原有的內置導航結構（不需要返回按鈕）
- 頂部保留探索、新記錄、設定三個快速按鈕

### ✅ Settings （設定頁）
```typescript
<PageLayout title="設定" showBack={true} onBackClick={() => navigate(-1)}>
```
- 點擊返回按鈕返回前一頁
- 支援完整的 API key 管理、備份、Google Drive 同步

### ✅ DreamDetail （夢境詳細頁）
```typescript
<PageLayout title={dream.dreamDate} showBack={true} onBackClick={() => navigate('/home')}>
```
- 顯示夢境日期為標題
- 點擊返回按鈕回首頁
- 支援編輯、分析、標籤管理

### ✅ Capture （快速記錄頁）
```typescript
<PageLayout title={displayDate} showBack={true} rightActions={saveButton}>
```
- 顯示夢境日期為標題
- 右側顯示儲存按鈕
- 點擊返回返回首頁

### ✅ Explore （探索頁）
```typescript
<PageLayout title="探索夢境" showBack={true} onBackClick={() => navigate(-1)}>
```
- 支援搜尋、篩選、標籤雲、90 天情緒圖表
- 點擊返回返回前一頁

### ✅ LucidLab （清明實驗室）
```typescript
<PageLayout title="Lucid Lab" showBack={true} onBackClick={() => navigate(-1)}>
```
- 三個 Tab：Reality Check、Dream Signs、WBTB
- 點擊返回返回前一頁

## 使用指南

### 為新頁面添加導航

1. **導入 PageLayout 和 useNavigate**
```typescript
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

export default function MyPage(): JSX.Element {
  const navigate = useNavigate();
```

2. **包裝頁面內容**
```typescript
return (
  <PageLayout 
    title="頁面標題"
    showBack={true}
    onBackClick={() => navigate(-1)}
  >
    {/* 頁面內容 */}
  </PageLayout>
);
```

3. **可選：添加右側操作按鈕**
```typescript
const rightActions = (
  <button onClick={handleSave}>儲存</button>
);

return (
  <PageLayout 
    title="頁面標題"
    showBack={true}
    rightActions={rightActions}
  >
    {/* 頁面內容 */}
  </PageLayout>
);
```

## 導航流程

```
首頁 (Home)
  ↓
  ├→ 新記錄 → Capture → 儲存 → 返回首頁
  ├→ 夢境列表項目 → DreamDetail (可修改、分析) → 返回首頁
  ├→ 探索 → Explore (搜尋、篩選) → 返回前一頁
  ├→ Lucid Lab → LucidLab (3個Tab) → 返回前一頁
  └→ 設定 → Settings (API、備份、Google Drive) → 返回前一頁
```

## 設計考量

### Navbar 樣式
- **固定位置**：`sticky top-0 z-50`
- **背景模糊**：`backdrop-blur-sm`，視覺上輕盈
- **邊框**：底部細邊框分隔，保持設計一致性

### 返回按鈕
- **圖標**：`←`（左箭頭）
- **大小**：40×40 px（符合觸控目標最小值 44×44）
- **交互**：Hover 時背景變淡，Active 時縮放

### 頁面標題
- 使用頁面中央作為視覺錨點
- 字體：`font-serif text-title font-light`
- 保持清晰易讀

## 已完成的檔案

### 新建檔案
- ✅ `src/components/Navbar.tsx` — 導航欄組件
- ✅ `src/components/PageLayout.tsx` — 頁面布局包裝器

### 修改檔案
- ✅ `src/pages/Settings.tsx` — 集成 PageLayout + 返回按鈕
- ✅ `src/pages/DreamDetail.tsx` — 集成 PageLayout + 返回按鈕
- ✅ `src/pages/Capture.tsx` — 集成 PageLayout + 儲存按鈕
- ✅ `src/pages/Explore.tsx` — 集成 PageLayout + 返回按鈕
- ✅ `src/pages/LucidLab.tsx` — 集成 PageLayout + 返回按鈕

## 測試狀態

✅ 構建成功（無 TypeScript 錯誤）
✅ 開發伺服器正常運行
✅ 所有頁面已集成導航系統

## 後續可優化

1. **動畫過渡**：添加頁面切換淡入淡出動畫
2. **導航路由圖**：在首頁或 Lab 頁面添加網站地圖
3. **麵包屑導航**：在需要時添加多層級導航顯示
4. **快捷鍵**：支援鍵盤快捷鍵（Esc 返回等）
