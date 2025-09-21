import env from '#start/env'
import { buildChatPrompt } from '#services/idea_prompt'
import OpenAI from 'openai'

export type GroupedFilters = Record<string, { id: number; name: string; slug: string }[]>

type ChatIdea = { title: string; summary: string }

export async function generateIdeaViaChat(
  byGenre: GroupedFilters,
  opts?: {
    temperature?: number
    top_p?: number
    presence_penalty?: number
    multiCount?: number
  }
): Promise<ChatIdea | ChatIdea[] > {
  const apiKey = env.get('OPENAI_API_KEY') as string | undefined
  const model = (env.get('OPENAI_MODEL') as string | undefined) || 'gpt-4o-mini'
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY non configurata')
  }

  const client = new OpenAI({ apiKey })
  const prompt = buildChatPrompt(byGenre, {
    banlist: (opts as any)?.banlist || [],
    diversityDirective: (opts as any)?.diversityDirective || undefined,
    multiCount: opts?.multiCount,
  })

  const chat = await client.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Sei un assistente che propone idee di prodotto testabili rapidamente. Rispondi esclusivamente in JSON valido con le chiavi "title" e "summary" o un array di tali oggetti.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: opts?.temperature ?? 0.7,
    top_p: opts?.top_p ?? 0.9,
    presence_penalty: opts?.presence_penalty ?? 0,
  })

  const content = chat.choices?.[0]?.message?.content ?? ''
  const parsed = safeParseIdeaJson(content)
  if (!parsed) {
    throw new Error('Risposta OpenAI non in JSON valido')
  }
  return parsed
}

function safeParseIdeaJson(text: string): ChatIdea | ChatIdea[] | null {
  if (!text) return null
  try {
    const obj = JSON.parse(text)
    if (Array.isArray(obj)) {
      const ok = obj.every((x) => x && typeof x.title === 'string' && typeof x.summary === 'string')
      return ok ? obj : null
    }
    if (obj && typeof obj.title === 'string' && typeof obj.summary === 'string') return obj
  } catch {}
  return null
}


