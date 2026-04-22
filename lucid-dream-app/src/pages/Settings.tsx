import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiKeyManager, AiProvider } from '../services/apiKey'
import { backupService } from '../services/backup'
import { ConfirmModal } from '../components/ConfirmModal'
import { DriveBackupSection } from '../components/DriveBackupSection'
import PageLayout from '../components/PageLayout'

type ConfirmAction = null | 'clear-all' | 'import'

interface ImportState {
  mode: 'replace' | 'merge' | null
  file: File | null
}

export default function Settings(): JSX.Element {
  const navigate = useNavigate()
  // API Key state
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>(apiKeyManager.getProvider())
  const [geminiKey, setGeminiKey] = useState('')
  const [qwenKey, setQwenKey] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  const [testingKey, setTestingKey] = useState(false)
  const [testError, setTestError] = useState<string | null>(null)

  // Backup state
  const [lastExportDays, setLastExportDays] = useState<number | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [importState, setImportState] = useState<ImportState>({ mode: null, file: null })
  const [importError, setImportError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Modal state
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [confirmText, setConfirmText] = useState('')

  useEffect(() => {
    const savedGemini = apiKeyManager.get('gemini')
    if (savedGemini) setGeminiKey(savedGemini)
    const savedQwen = apiKeyManager.get('qwen')
    if (savedQwen) setQwenKey(savedQwen)
    setSelectedProvider(apiKeyManager.getProvider())

    const days = backupService.getDaysSinceLastExport()
    setLastExportDays(days)
  }, [])

  // API Key handlers
  const handleSaveApiKey = (): void => {
    const key = selectedProvider === 'gemini' ? geminiKey : qwenKey
    if (key.trim()) {
      apiKeyManager.set(key, selectedProvider)
      apiKeyManager.setProvider(selectedProvider)
      setShowSaved(true)
      setTestError(null)
      setTimeout(() => setShowSaved(false), 2000)
    }
  }

  const handleClearApiKey = (): void => {
    apiKeyManager.clear(selectedProvider)
    if (selectedProvider === 'gemini') setGeminiKey('')
    else setQwenKey('')
    setTestError(null)
  }

  const handleTestApiKey = async (): Promise<void> => {
    const currentKey = selectedProvider === 'gemini' ? geminiKey : qwenKey
    if (!currentKey.trim()) {
      setTestError('請先輸入 API key')
      return
    }

    setTestingKey(true)
    setTestError(null)

    try {
      let response: Response
      if (selectedProvider === 'gemini') {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(currentKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'test' }] }] }),
            signal: AbortSignal.timeout(5000),
          } as any
        )
      } else {
        response = await fetch(
          'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentKey}`,
            },
            body: JSON.stringify({
              model: 'qwen-turbo',
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 5,
            }),
            signal: AbortSignal.timeout(5000),
          } as any
        )
      }

      if (response.status === 401 || response.status === 403) {
        setTestError('API key 無效')
      } else if (response.ok || response.status === 429) {
        setTestError(null)
      } else {
        setTestError('連接失敗，請檢查網路')
      }
    } catch {
      setTestError('測試失敗，請檢查網路連接')
    } finally {
      setTestingKey(false)
    }
  }

  // Export handler
  const handleExport = async (): Promise<void> => {
    setIsExporting(true)
    setExportError(null)

    try {
      const blob = await backupService.exportAllToJson()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const now = new Date()
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      link.href = url
      link.download = `lucid-dream-backup-${dateStr}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      backupService.markExported()
      setLastExportDays(0)
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知錯誤'
      setExportError(`匯出失敗：${message}`)
    } finally {
      setIsExporting(false)
    }
  }

  // Import handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      setImportState({ mode: null, file })
      setImportError(null)
      setImportResult(null)
    }
  }

  const handleImportConfirm = async (): Promise<void> => {
    if (!importState.file || !importState.mode) return

    try {
      const result = await backupService.importFromJson(importState.file, importState.mode)
      setImportResult(result)
      setImportState({ mode: null, file: null })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知錯誤'
      setImportError(message)
    }
  }

  const handleClearAllDreams = async (): Promise<void> => {
    try {
      await backupService.clearAllDreams()
      setConfirmAction(null)
      setConfirmText('')
      setLastExportDays(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知錯誤'
      setExportError(`清除失敗：${message}`)
    }
  }

  return (
    <PageLayout title="設定" showBack={true} onBackClick={() => navigate(-1)}>
      <div className="mx-auto max-w-md space-y-8">

          {/* AI Service Section */}
          <section className="space-y-3">
            <div>
              <h2 className="text-body font-semibold text-text-primary">AI 分析</h2>
              <p className="text-small text-text-secondary mt-1">選擇 AI 服務並設定 API key</p>
            </div>

            <div className="space-y-3 bg-bg-secondary rounded-lg border border-border-subtle p-4">
              {/* Provider selector */}
              <div className="flex overflow-hidden rounded-lg border border-border-subtle">
                <button
                  onClick={() => setSelectedProvider('gemini')}
                  className={`flex-1 py-2 text-small font-medium transition-colors duration-normal ${
                    selectedProvider === 'gemini'
                      ? 'bg-accent text-bg-primary'
                      : 'bg-bg-primary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Gemini
                </button>
                <button
                  onClick={() => setSelectedProvider('qwen')}
                  className={`flex-1 py-2 text-small font-medium transition-colors duration-normal ${
                    selectedProvider === 'qwen'
                      ? 'bg-accent text-bg-primary'
                      : 'bg-bg-primary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  通義千問
                </button>
              </div>

              <div>
                <label htmlFor="apiKey" className="block text-small font-medium text-text-primary mb-2">
                  API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={selectedProvider === 'gemini' ? geminiKey : qwenKey}
                  onChange={(e) =>
                    selectedProvider === 'gemini'
                      ? setGeminiKey(e.target.value)
                      : setQwenKey(e.target.value)
                  }
                  placeholder={
                    selectedProvider === 'gemini'
                      ? '貼上您的 Gemini API key'
                      : '貼上您的通義千問 API key'
                  }
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-border-default transition-colors duration-normal"
                />
                {testError && <p className="text-small text-danger mt-2">{testError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleTestApiKey}
                  disabled={testingKey || !(selectedProvider === 'gemini' ? geminiKey : qwenKey).trim()}
                  className="px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-small font-medium text-text-primary transition-colors duration-normal hover:border-border-default disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testingKey ? '測試中…' : '測試'}
                </button>
                <button
                  onClick={handleSaveApiKey}
                  disabled={!(selectedProvider === 'gemini' ? geminiKey : qwenKey).trim()}
                  className="px-3 py-2 bg-accent rounded-lg text-small font-medium text-bg-primary transition-colors duration-normal hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  儲存
                </button>
              </div>

              {showSaved && (
                <p className="text-small text-success text-center">✓ 已儲存</p>
              )}

              <button
                onClick={handleClearApiKey}
                className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-small text-text-secondary transition-colors duration-normal hover:border-border-default"
              >
                清除
              </button>

              <p className="text-caption text-text-muted">
                API key 僅儲存於本機，不會上傳任何伺服器。
              </p>
              {selectedProvider === 'gemini' ? (
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-accent text-caption underline hover:opacity-80"
                >
                  取得 Gemini API key →
                </a>
              ) : (
                <a
                  href="https://dashscope.console.aliyun.com/apiKey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-accent text-caption underline hover:opacity-80"
                >
                  取得通義千問 API key →
                </a>
              )}
            </div>
          </section>

          {/* Data Management Section */}
          <section className="space-y-3">
            <div>
              <h2 className="text-body font-semibold text-text-primary">資料管理</h2>
              <p className="text-small text-text-secondary mt-1">備份與復原夢境記錄</p>
            </div>

            <div className="space-y-3 bg-bg-secondary rounded-lg border border-border-subtle p-4">
              {/* Export */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-small font-medium text-text-primary">匯出全部資料</label>
                  {lastExportDays !== null && (
                    <span className="text-caption text-text-muted">
                      {lastExportDays === 0 ? '剛剛' : `${lastExportDays} 天前`}
                    </span>
                  )}
                </div>
                <p className="text-caption text-text-muted">
                  下載 JSON 檔案備份所有夢境記錄
                </p>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full px-3 py-2 bg-accent rounded-lg text-small font-medium text-bg-primary transition-colors duration-normal hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? '匯出中…' : '⬇ 匯出'}
                </button>
                {exportError && <p className="text-small text-danger">{exportError}</p>}
              </div>

              <div className="border-t border-border-subtle" />

              {/* Import */}
              <div className="space-y-2">
                <label className="text-small font-medium text-text-primary">匯入資料</label>
                <p className="text-caption text-text-muted">
                  從備份檔案復原夢境記錄
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg text-small font-medium text-text-primary transition-colors duration-normal hover:border-border-default"
                >
                  選擇檔案
                </button>

                {importState.file && !importState.mode && (
                  <div className="space-y-2 p-2 bg-bg-primary rounded border border-border-subtle">
                    <p className="text-caption text-text-secondary truncate">
                      📄 {importState.file.name}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setImportState({ ...importState, mode: 'replace' })}
                        className="px-2 py-1 bg-bg-secondary border border-border-subtle rounded text-caption font-medium text-text-primary hover:border-border-default transition-colors duration-normal"
                      >
                        取代現有
                      </button>
                      <button
                        onClick={() => setImportState({ ...importState, mode: 'merge' })}
                        className="px-2 py-1 bg-bg-secondary border border-border-subtle rounded text-caption font-medium text-text-primary hover:border-border-default transition-colors duration-normal"
                      >
                        合併
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setImportState({ mode: null, file: null })
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="w-full text-caption text-text-muted hover:text-text-secondary transition-colors"
                    >
                      取消
                    </button>
                  </div>
                )}

                {importState.file && importState.mode && (
                  <ConfirmModal
                    title={importState.mode === 'replace' ? '確認取代資料' : '確認合併資料'}
                    message={
                      importState.mode === 'replace'
                        ? '將清除所有現有夢境記錄並匯入備份檔案。此操作無法復原。'
                        : '相同 ID 的夢境記錄將被跳過。'
                    }
                    confirmText={importState.mode === 'replace' ? '取代全部' : '合併'}
                    onConfirm={handleImportConfirm}
                    onCancel={() => setImportState({ mode: null, file: null })}
                  />
                )}

                {importError && <p className="text-small text-danger">{importError}</p>}
                {importResult && (
                  <div className="p-2 bg-bg-primary rounded border border-border-subtle">
                    <p className="text-caption text-text-secondary">
                      ✓ 成功新增 {importResult.added} 筆夢境
                      {importResult.skipped > 0 ? `，跳過 ${importResult.skipped} 筆` : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Google Drive Backup */}
          <DriveBackupSection />

          {/* Danger Zone */}
          <section className="space-y-3">
            <div>
              <h2 className="text-body font-semibold text-danger">危險區域</h2>
              <p className="text-small text-text-muted mt-1">不可復原的操作</p>
            </div>

            <div className="space-y-2 bg-bg-secondary rounded-lg border border-border-subtle p-4">
              <button
                onClick={() => setConfirmAction('clear-all')}
                className="w-full px-3 py-2 bg-bg-primary border border-danger rounded-lg text-small font-medium text-danger transition-colors duration-normal hover:bg-red-950"
              >
                清除所有資料
              </button>
              <p className="text-caption text-text-muted">
                永久刪除所有夢境記錄。此操作無法復原，請先備份。
              </p>
            </div>
          </section>
      </div>

      {/* Confirm Modal */}
      {confirmAction === 'clear-all' && (
        <ConfirmModal
          title="清除所有資料"
          message="此操作將永久刪除所有夢境記錄，無法復原。請先確保已備份重要資料。"
          confirmText="清除全部"
          confirmValue="清除全部"
          currentValue={confirmText}
          onValueChange={setConfirmText}
          onConfirm={() => handleClearAllDreams()}
          onCancel={() => {
            setConfirmAction(null)
            setConfirmText('')
          }}
        />
      )}
    </PageLayout>
  )
}
