export interface AnalysisResult {
  summary: string
  extractedTags: string[]
  model: string
  analyzedAt: string
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

export class MissingApiKeyError extends Error {
  constructor() {
    super('Gemini API key 未設定')
    this.name = 'MissingApiKeyError'
  }
}

export class InvalidApiKeyError extends Error {
  constructor() {
    super('Gemini API key 無效')
    this.name = 'InvalidApiKeyError'
  }
}

export class RateLimitError extends Error {
  constructor() {
    super('請稍後再試')
    this.name = 'RateLimitError'
  }
}

export class AnalysisError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AnalysisError'
  }
}
