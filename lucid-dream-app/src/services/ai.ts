import { apiKeyManager } from './apiKey'
import {
  AnalysisResult,
  GeminiResponse,
  MissingApiKeyError,
  InvalidApiKeyError,
  RateLimitError,
  AnalysisError
} from '../types/ai'

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const MODEL_NAME = 'gemini-2.0-flash'

const SYSTEM_INSTRUCTION = `你是一位夢境記錄分析助手。你的任務是針對使用者提供的單一夢境敘述，產出簡短的心理層面觀察與標籤。
嚴格規則：

不要使用任何玄學、解夢字典、命理術語（例如「夢到水代表財運」之類）
不要過度詮釋，不要編造夢中沒有的元素
以心理學角度（情緒主題、可能在處理的議題）為主
若資訊不足，明確說「資訊有限，難以評論」，不要硬掰
不要安慰、不要鼓勵、不要評價對錯
用繁體中文，語氣中性、簡潔、像觀察筆記`

const RESPONSE_SCHEMA = {
  type: 'OBJECT' as const,
  properties: {
    summary: {
      type: 'STRING' as const,
      description: '一段 50–120 字的中性觀察，聚焦於這個夢可能在處理的情緒主題或關注點。不要列點，用流暢的句子。'
    },
    extractedTags: {
      type: 'ARRAY' as const,
      items: {
        type: 'STRING' as const
      },
      description: '3 到 8 個從夢境中出現的具體名詞或情緒，扁平單層，不分類別。例如：父親、醫院、迷路、焦慮、飛行'
    }
  },
  required: ['summary', 'extractedTags']
}

export async function analyzeDream(content: string): Promise<AnalysisResult> {
  const apiKey = apiKeyManager.get()
  if (!apiKey) {
    throw new MissingApiKeyError()
  }

  const requestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    contents: [
      {
        parts: [
          {
            text: `夢境內容：
"""
${content}
"""

請輸出 JSON。`
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA
    }
  }

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (response.status === 401 || response.status === 403) {
      throw new InvalidApiKeyError()
    }

    if (response.status === 429) {
      throw new RateLimitError()
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new AnalysisError(
        `Gemini API 錯誤 (${response.status}): ${errorData.error?.message || '未知錯誤'}`
      )
    }

    const data: GeminiResponse = await response.json()

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new AnalysisError('Gemini API 回傳無效的響應格式')
    }

    const responseText = data.candidates[0].content.parts[0].text
    let parsedResponse: { summary?: string; extractedTags?: string[] }

    try {
      parsedResponse = JSON.parse(responseText)
    } catch {
      throw new AnalysisError('無法解析 Gemini API 的 JSON 響應')
    }

    if (!parsedResponse.summary || !Array.isArray(parsedResponse.extractedTags)) {
      throw new AnalysisError('Gemini API 響應缺少必要的欄位')
    }

    const result: AnalysisResult = {
      summary: parsedResponse.summary,
      extractedTags: parsedResponse.extractedTags,
      model: MODEL_NAME,
      analyzedAt: new Date().toISOString()
    }

    return result
  } catch (error) {
    if (
      error instanceof MissingApiKeyError ||
      error instanceof InvalidApiKeyError ||
      error instanceof RateLimitError ||
      error instanceof AnalysisError
    ) {
      throw error
    }

    if (error instanceof TypeError) {
      throw new AnalysisError('網路連接錯誤，請檢查您的網際網路連接')
    }

    throw new AnalysisError(`分析失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
  }
}
