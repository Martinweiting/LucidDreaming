import { useState, useEffect } from 'react'
import { apiKeyManager } from '../services/apiKey'

export default function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    const savedKey = apiKeyManager.get()
    if (savedKey) {
      setApiKey(savedKey)
    }
  }, [])

  const handleSave = () => {
    if (apiKey.trim()) {
      apiKeyManager.set(apiKey)
      setShowSaved(true)
      setTimeout(() => {
        setShowSaved(false)
      }, 2000)
    }
  }

  const handleClear = () => {
    apiKeyManager.clear()
    setApiKey('')
  }

  return (
    <div className="min-h-screen bg-surface p-4">
      <div className="mx-auto max-w-md">
        <h1 className="text-heading mb-6 mt-8">設定</h1>

        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-body font-medium text-primary mb-2">
              Gemini API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="貼上您的 Gemini API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-body"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={handleSave}
              className="w-full px-4 py-2 bg-accent text-white rounded-lg text-body font-medium hover:opacity-90"
            >
              儲存
            </button>
            <button
              onClick={handleClear}
              className="w-full px-4 py-2 bg-gray-300 text-primary rounded-lg text-body font-medium hover:opacity-90"
            >
              清除
            </button>
          </div>

          {showSaved && (
            <div className="px-3 py-2 bg-blue-100 text-blue-900 rounded-lg text-small text-center">
              已儲存
            </div>
          )}

          <div className="mt-6 p-4 bg-secondary rounded-lg">
            <p className="text-small text-secondary mb-3">
              API key 僅儲存於本機，不會上傳任何伺服器。
            </p>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-accent text-small underline hover:opacity-80"
            >
              前往 Google AI Studio 取得免費 API key
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
