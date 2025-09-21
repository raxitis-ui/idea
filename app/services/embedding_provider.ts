import env from '#start/env'
import OpenAI from 'openai'

export async function embedText(input: string): Promise<number[]> {
  const apiKey = env.get('OPENAI_API_KEY') as string | undefined
  const model = (env.get('OPENAI_EMBED_MODEL') as string | undefined) || 'text-embedding-3-small'
  if (!apiKey) throw new Error('OPENAI_API_KEY non configurata')
  const client = new OpenAI({ apiKey })
  const res = await client.embeddings.create({ model, input })
  const vec = (res.data?.[0]?.embedding || []) as number[]
  return l2normalize(vec)
}

export function l2normalize(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1
  return v.map((x) => x / norm)
}

export function cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  let s = 0
  for (let i = 0; i < n; i++) s += a[i] * b[i]
  return s
}

