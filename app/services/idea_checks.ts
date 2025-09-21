// Stubs per i check: implementarli in seguito

export type NormalizedDraft = {
  title: string
  summary: string
  category: string
  target_age: { min: number; max: number }
  geo: string[]
  revenue: string[]
}

export function normalizeDraft(_d: any): NormalizedDraft {
  return {
    title: '',
    summary: '',
    category: '',
    target_age: { min: 0, max: 0 },
    geo: [],
    revenue: [],
  }
}

export function buildCanonicalString(_n: NormalizedDraft): string {
  return ''
}

export function titleFingerprint(_raw: string): { collapsed: string; tokens: string[] } {
  return { collapsed: '', tokens: [] }
}

export function textualSimilarity(_a: string, _b: string): number {
  return 0
}

export function embedIdea(_d: NormalizedDraft): number[] {
  return []
}

export function cosineSimilarity(_a: number[], _b: number[]): number {
  return 0
}

