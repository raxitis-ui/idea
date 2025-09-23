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
        `
          Genera una singola idea di business in formato JSON valido, rispettando questi criteri:
- Deve essere strettamente pertinente ai filtri o al contesto passato.
- L’idea deve risolvere un problema reale o sfruttare una tendenza di mercato verificabile.
- Specifica chiaramente il target di clienti e il vantaggio competitivo.
- Evita concetti vaghi, buzzword inutili o tecnologie non disponibili oggi.
- Fornisci solo **un oggetto JSON** con le chiavi "title" e "summary".
- La "summary" deve includere: problema risolto, pubblico di riferimento, proposta di valore e perché ha potenziale di successo nel mercato attuale.
 - NON lasciare vuoti "title" o "summary". Il titolo deve avere almeno 8 caratteri reali (no placeholder). La summary deve avere almeno 60 caratteri e massimo 600.
 - Rispondi SOLO con JSON valido, senza testo aggiuntivo prima o dopo.

Esempio formato output:
{
  "title": "Servizio di check-up energetico per boutique hotel storici",
  "summary": "Aiuta i proprietari di boutique hotel in edifici vincolati a ridurre costi energetici: analisi non invasiva, raccomandazioni mirate e accesso a incentivi. Target: piccoli albergatori in centri storici. Vantaggio: approccio low-cost, compatibile con vincoli architettonici, e mercato in crescita grazie alla spinta verso la sostenibilità."
}
  `
,
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
    const isValid = (x: any) => {
      const title = typeof x?.title === 'string' ? x.title.trim() : ''
      const summary = typeof x?.summary === 'string' ? x.summary.trim() : ''
      return title.length >= 8 && summary.length >= 60
    }
    if (Array.isArray(obj)) {
      const filtered = obj.filter((x) => isValid(x))
      return filtered.length > 0 ? filtered : null
    }
    if (isValid(obj)) return obj
  } catch {}
  return null
}


