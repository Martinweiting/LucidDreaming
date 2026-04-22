import { apiKeyManager } from './apiKey'
import {
  AnalysisResult,
  GeminiResponse,
  QwenResponse,
  MissingApiKeyError,
  InvalidApiKeyError,
  RateLimitError,
  AnalysisError,
} from '../types/ai'

const GEMINI_MODEL = 'gemini-2.5-pro'
const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const QWEN_API_ENDPOINT = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
const QWEN_MODEL = 'qwen-max'

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
      description: '一段 50–120 字的中性觀察，聚焦於這個夢可能在處理的情緒主題或關注點。不要列點，用流暢的句子。',
    },
    extractedTags: {
      type: 'ARRAY' as const,
      items: { type: 'STRING' as const },
      description: '3 到 8 個從夢境中出現的具體名詞或情緒，扁平單層，不分類別。例如：父親、醫院、迷路、焦慮、飛行',
    },
  },
  required: ['summary', 'extractedTags'],
}

export function getManualAnalysisPrompt(content: string): string {
  return `${SYSTEM_INSTRUCTION}

夢境內容：
"""
${content}
"""

請以 JSON 格式輸出，包含以下欄位：
{
  "summary": "（50–120 字的中性觀察，用流暢的句子，繁體中文）",
  "extractedTags": ["標籤1", "標籤2", "標籤3"]
}`
}

function parseJsonText(text: string): { summary?: string; extractedTags?: string[] } {
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  return JSON.parse(cleaned) as { summary?: string; extractedTags?: string[] }
}

async function analyzeWithGemini(content: string, apiKey: string): Promise<AnalysisResult> {
  const requestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents: [
      {
        parts: [
          {
            text: `夢境內容：\n"""\n${content}\n"""\n\n請輸出 JSON。`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  }

  const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (response.status === 401 || response.status === 403) throw new InvalidApiKeyError()
  if (response.status === 429) throw new RateLimitError()
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } }
    throw new AnalysisError(
      `Gemini API 錯誤 (${response.status}): ${errorData.error?.message ?? '未知錯誤'}`
    )
  }

  const data: GeminiResponse = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new AnalysisError('Gemini API 回傳無效的響應格式')

  let parsed: { summary?: string; extractedTags?: string[] }
  try {
    parsed = parseJsonText(text)
  } catch {
    throw new AnalysisError('無法解析 Gemini API 的 JSON 響應')
  }

  if (!parsed.summary || !Array.isArray(parsed.extractedTags)) {
    throw new AnalysisError('Gemini API 響應缺少必要的欄位')
  }

  return {
    summary: parsed.summary,
    extractedTags: parsed.extractedTags,
    model: GEMINI_MODEL,
    analyzedAt: new Date().toISOString(),
  }
}

async function analyzeWithQwen(content: string, apiKey: string): Promise<AnalysisResult> {
  const requestBody = {
    model: QWEN_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      {
        role: 'user',
        content: `夢境內容：\n"""\n${content}\n"""\n\n請輸出 JSON，包含 summary 和 extractedTags 欄位。`,
      },
    ],
    response_format: { type: 'json_object' },
  }

  const response = await fetch(QWEN_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  })

  if (response.status === 401 || response.status === 403) throw new InvalidApiKeyError()
  if (response.status === 429) throw new RateLimitError()
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { message?: string }
    throw new AnalysisError(
      `通義千問 API 錯誤 (${response.status}): ${errorData.message ?? '未知錯誤'}`
    )
  }

  const data: QwenResponse = await response.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new AnalysisError('通義千問 API 回傳無效的響應格式')

  let parsed: { summary?: string; extractedTags?: string[] }
  try {
    parsed = parseJsonText(text)
  } catch {
    throw new AnalysisError('無法解析通義千問 API 的 JSON 響應')
  }

  if (!parsed.summary || !Array.isArray(parsed.extractedTags)) {
    throw new AnalysisError('通義千問 API 響應缺少必要的欄位')
  }

  return {
    summary: parsed.summary,
    extractedTags: parsed.extractedTags,
    model: QWEN_MODEL,
    analyzedAt: new Date().toISOString(),
  }
}

export async function analyzeDream(content: string): Promise<AnalysisResult> {
  const provider = apiKeyManager.getProvider()
  const apiKey = apiKeyManager.get(provider)
  if (!apiKey) throw new MissingApiKeyError()

  try {
    if (provider === 'qwen') {
      return await analyzeWithQwen(content, apiKey)
    }
    return await analyzeWithGemini(content, apiKey)
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
