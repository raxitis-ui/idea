import type { HttpContext } from '@adonisjs/core/http'
import Filter from '#models/filter'
import { buildChatPrompt } from '#services/idea_prompt'
import { generateIdeaViaChat } from '#services/chat_provider'
import Idea from '#models/idea'
import crypto from 'node:crypto'
import * as stringSimilarity from 'string-similarity'
import { embedText, cosine } from '#services/embedding_provider'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import IdeaReaction from '#models/idea_reaction'

export default class IdeasController {
  public async react({ auth, params, request, response }: HttpContext) {
    const user = await auth.use('api').authenticate()
    const ideaId = Number(params.id)
    console.log(ideaId)
    const reaction = normalizeReaction(request.input('reaction'))
    console.log(request.input('reaction'))
    console.log(request.all() || "ciao")
    const userId = user?.id
    if (!Number.isFinite(ideaId) || !reaction) {
      return response.badRequest({ message: 'Parametri non validi' })
    }
    

    const trx = await db.transaction()
    try {
      // upsert reaction
      const existing = await IdeaReaction.query({ client: trx })
        .where('idea_id', ideaId)
        .andWhere('user_id', userId)
        .first()

      if (existing) {
        if (existing.reaction === reaction) {
          await trx.rollback()
          return response.ok({ updated: false, message: 'Nessuna modifica' })
        }
        existing.reaction = reaction as any
        await existing.save()
      } else {
        await IdeaReaction.create({ ideaId, userId, reaction: reaction as any }, { client: trx })
      }

      // sync counters
      const counts = await IdeaReaction.query({ client: trx })
        .where('idea_id', ideaId)
        .select(db.raw("SUM(reaction='like') as likes"), db.raw("SUM(reaction='dislike') as dislikes"))
        .first()

      await Idea.query({ client: trx })
        .where('id', ideaId)
        .update({
          likes_count: Number((counts as any)?.likes ?? 0),
          dislikes_count: Number((counts as any)?.dislikes ?? 0),
        })

      await trx.commit()
      const idea = await Idea.find(ideaId)
      return response.ok({ updated: true, idea })
    } catch (e) {
      await trx.rollback()
      return response.internalServerError({ message: 'Errore nel salvataggio reazione' })
    }
  }
  public async index({ request, response }: HttpContext) {
    const limit = Math.min(Number(request.input('limit', 1000)) || 1000, 10000)
    const offset = Number(request.input('offset', 0)) || 0
    const includeEmbedding = String(request.input('include_embedding', 'true')).toLowerCase() !== 'false'

    const ideas = await Idea.query().orderBy('id', 'desc').limit(limit).offset(offset)

    const data = ideas.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      canonical_hash: (i as any).canonicalHash ?? (i as any).canonical_hash ?? null,
      duplicate_group_id: (i as any).duplicateGroupId ?? (i as any).duplicate_group_id ?? null,
      created_at: i.createdAt,
      embedding: includeEmbedding ? i.embedding : undefined,
      embedding_length: includeEmbedding && i.embedding ? String(i.embedding).length : undefined,
    }))

    return response.ok({ count: data.length, limit, offset, includeEmbedding, data })
  }
  public async search({ request, response }: HttpContext) {
    const limit = Math.min(Number(request.input('limit', 50)) || 50, 200)
    const offset = Number(request.input('offset', 0)) || 0

    const raw = request.input('filters')
    let ids: number[] = []
    if (Array.isArray(raw)) ids = raw.map((v) => Number(v)).filter((n) => Number.isFinite(n))
    else if (typeof raw === 'string') ids = raw.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n))

    const sort = String(request.input('sort', '')).toLowerCase()
    const topVoted = String(request.input('top_voted', 'false')).toLowerCase() === 'true' || sort === 'votes'

    let rows: any[] = []
    if (ids.length === 0) {
      // Nessun filtro: mostra tutte ordinate per più votate
      rows = await db
        .from('ideas')
        .leftJoin('idea_reactions as r', 'r.idea_id', 'ideas.id')
        .select(
          'ideas.id',
          'ideas.title',
          'ideas.description',
          db.raw("COALESCE(SUM(CASE WHEN r.reaction='like' THEN 1 ELSE 0 END), ideas.likes_count, 0) as likes_count"),
          db.raw("COALESCE(SUM(CASE WHEN r.reaction='dislike' THEN 1 ELSE 0 END), ideas.dislikes_count, 0) as dislikes_count"),
          db.raw("COALESCE(SUM(CASE WHEN r.reaction='like' THEN 1 ELSE 0 END), ideas.likes_count, 0) - COALESCE(SUM(CASE WHEN r.reaction='dislike' THEN 1 ELSE 0 END), ideas.dislikes_count, 0) as votes_score")
        )
        .groupBy('ideas.id')
        .orderBy('votes_score', 'desc')
        .orderBy('ideas.id', 'desc')
        .limit(limit)
        .offset(offset)
    } else {
      // Con filtri: calcola match_count e includi i contatori
      const base = db
        .from('ideas')
        .leftJoin('idea_reactions as r', 'r.idea_id', 'ideas.id')
        .select(
          'ideas.id',
          'ideas.title',
          'ideas.description',
          db.raw("COALESCE(SUM(CASE WHEN r.reaction='like' THEN 1 ELSE 0 END), ideas.likes_count, 0) as likes_count"),
          db.raw("COALESCE(SUM(CASE WHEN r.reaction='dislike' THEN 1 ELSE 0 END), ideas.dislikes_count, 0) as dislikes_count"),
          db.raw("COALESCE(SUM(CASE WHEN r.reaction='like' THEN 1 ELSE 0 END), ideas.likes_count, 0) - COALESCE(SUM(CASE WHEN r.reaction='dislike' THEN 1 ELSE 0 END), ideas.dislikes_count, 0) as votes_score")
        )
        .countDistinct({ match_count: 'idea_filters.filter_id' })
        .join('idea_filters', 'idea_filters.idea_id', 'ideas.id')
        .whereIn('idea_filters.filter_id', ids)
        .groupBy('ideas.id')

      if (topVoted) {
        rows = await base
          .orderBy('votes_score', 'desc')
          .orderBy('match_count', 'desc')
          .orderBy('ideas.id', 'desc')
          .limit(limit)
          .offset(offset)
      } else {
        rows = await base
          .orderBy('match_count', 'desc')
          .orderBy('ideas.id', 'desc')
          .limit(limit)
          .offset(offset)
      }
    }

    const data = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      likes_count: Number(r.likes_count ?? 0),
      dislikes_count: Number(r.dislikes_count ?? 0),
      match_count: r.match_count !== undefined ? Number(r.match_count) : undefined,
      votes_score: r.votes_score !== undefined ? Number(r.votes_score) : undefined,
    }))

    return response.ok({ count: data.length, limit, offset, data })
  }
  public async generate({ request, response }: HttpContext) {
    const body = request.all()
    const input = Array.isArray(body.filters) ? body.filters : []

    const ids = new Set<number>()
    for (const item of input) {
      const n = Number(item)
      if (Number.isFinite(n)) ids.add(n)
    }

    const idsArr = Array.from(ids)
    const found = idsArr.length === 0 ? [] : await Filter.query().whereIn('id', idsArr).preload('genre')

    const byGenre: Record<string, { id: number; name: string; slug: string }[]> = {}
    for (const f of found) {
      const genreName = (f as any).genre?.name || 'Senza genere'
      if (!byGenre[genreName]) byGenre[genreName] = []
      byGenre[genreName].push({ id: f.id, name: f.name, slug: (f as any).slug })
    }

    const foundIds = new Set(found.map((f) => f.id))
    const unresolvedIds = idsArr.filter((i) => !foundIds.has(i))

    const prompt_suggestion = buildChatPrompt(byGenre)

    // Pre-carica pool ultime N idee per similarità testuale (facoltativo: filtrare per categoria)
    const candidates = await Idea.query()
      .select(['id', 'title', 'description', 'embedding'])
      .orderBy('id', 'desc')
      .limit(10000)

    // Sampling setup
    const directives = [
      'angolo go-to-market insolito (partnership, community, B2B2C)',
      'micro-nicchia all’interno del target scelto',
      'modello di pricing non standard (tier annuale, usage-based, bundles)',
      'dato unico/fonte dati proprietaria',
      'MVP iniziale diverso da landing+ads (concierge, no-code, manuale)'
    ]

    const banlist = new Set<string>()
    const rejectedTitles: string[] = []

    // helpers
    const addToBanlist = (title: string, summary: string, neighbor?: { title?: string; summary?: string }) => {
      const kws = extractKeywords(`${title} ${summary}`)
      kws.forEach((k) => banlist.add(k))
      if (neighbor) {
        const nk = extractKeywords(`${neighbor.title || ''} ${neighbor.summary || ''}`)
        nk.slice(0, 5).forEach((k) => banlist.add(k))
      }
    }

    let chatIdea: { title: string; summary: string } | null = null
    let title_norm = ''
    let summary_norm = ''
    let canonical_hash: string | null = null
    let dedupDecision: 'REJECT' | 'ACCEPT_LINK' | 'ACCEPT' | null = null
    let nearestId: number | null = null
    let nearestScore: number | null = null
    let lastEmbedding: number[] | null = null
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      attempts++
      try {
        // diversify per attempt
        const diversityDirective = directives[Math.floor(Math.random() * directives.length)]
        const sampling =
          attempts === 1
            ? { temperature: 0.7, top_p: 0.9 }
            : attempts === 2
            ? { temperature: 0.9, top_p: 0.95, presence_penalty: 0.6 }
            : { temperature: 0.9, top_p: 0.95, presence_penalty: 0.6, multiCount: 5 }

        const llmOut = await generateIdeaViaChat(byGenre, {
          ...sampling,
          // passiamo banlist e directive tramite buildChatPrompt (letto in service)
          // @ts-ignore
          banlist: Array.from(banlist),
          // @ts-ignore
          diversityDirective,
          multiCount: (sampling as any).multiCount,
        })

        const candidatesIdeas = Array.isArray(llmOut) ? llmOut : [llmOut]

        // prova ciascun candidato dell'ultimo tentativo, altrimenti uno alla volta
        for (const idea of candidatesIdeas) {
          // normalizza
          title_norm = normalizeText(idea.title)
          summary_norm = normalizeText(idea.summary)
          const canonical = `${title_norm}|${summary_norm}`
          const hash = crypto.createHash('sha256').update(canonical).digest('hex')
          // check duplicato esatto
          const exists = await Idea.query().where('canonical_hash', hash).first()
          if (exists) {
            console.log('[dedup][exact] duplicate hash hit, id=', exists.id)
            rejectedTitles.push(idea.title)
            addToBanlist(idea.title, idea.summary)
            continue // prova prossimo candidato o rigenera
          }

          // Check 2 — similarità testuale
          const isTitleGeneric = title_norm.length < 6 || title_norm.split(' ').length <= 2

          let rejectByText = false
          let bestTitleScore = 0
          let bestTitleId: number | null = null
          let bestSummaryScore = 0
          let bestSummaryId: number | null = null

          for (const c of candidates) {
            const cTitle = normalizeText(c.title || '')
            const cSummary = normalizeText(c.description || '')

            if (!isTitleGeneric && cTitle) {
              const tScore = stringSimilarity.compareTwoStrings(title_norm, cTitle)
              if (tScore > bestTitleScore) {
                bestTitleScore = tScore
                bestTitleId = c.id
              }
              if (tScore >= 0.80) {
                console.log('[dedup][textual][title] score=', tScore.toFixed(4), 'against id=', c.id)
                rejectByText = true
                break
              }
            }

            if (cSummary) {
              const sScore = stringSimilarity.compareTwoStrings(summary_norm, cSummary)
              if (sScore > bestSummaryScore) {
                bestSummaryScore = sScore
                bestSummaryId = c.id
              }
              if (sScore >= 0.88) {
                console.log('[dedup][textual][summary] score=', sScore.toFixed(4), 'against id=', c.id)
                rejectByText = true
                break
              }
            }
          }

          if (rejectByText) {
            console.log(
              '[dedup][textual] rejecting. bestTitle=',
              bestTitleScore.toFixed(4),
              'id=',
              bestTitleId,
              'bestSummary=',
              bestSummaryScore.toFixed(4),
              'id=',
              bestSummaryId
            )
            rejectedTitles.push(idea.title)
            addToBanlist(
              idea.title,
              idea.summary,
              {
                title: candidates.find((x) => x.id === bestTitleId)?.title ?? undefined,
                summary: candidates.find((x) => x.id === bestSummaryId)?.description ?? undefined,
              }
            )
            continue
          }

          // Check 3 — Embedding
          const embedInput = `${title_norm}\n${summary_norm}`
          const eNew = await embedText(embedInput)
          lastEmbedding = eNew

          let bestCos = -1
          let bestId: number | null = null
          for (const c of candidates) {
            if (!c.embedding) continue
            const emb = typeof (c as any).embedding === 'string' ? (JSON.parse((c as any).embedding) as number[]) : ((c as any).embedding as number[])
            if (!Array.isArray(emb) || emb.length === 0) continue
            const cos = cosine(eNew, emb as number[])
            if (cos > bestCos) {
              bestCos = cos
              bestId = c.id
            }
          }

          console.log('[dedup][embedding] bestCos=', bestCos.toFixed(4), 'nearestId=', bestId)

          if (bestCos >= 0.80) {
            console.log('[dedup][embedding] REJECT (semantic)')
            rejectedTitles.push(idea.title)
            addToBanlist(
              idea.title,
              idea.summary,
              {
                title: candidates.find((x) => x.id === bestId)?.title ?? undefined,
                summary: candidates.find((x) => x.id === bestId)?.description ?? undefined,
              }
            )
            continue
          }
          if (bestCos >= 0.75) {
            dedupDecision = 'ACCEPT_LINK'
            nearestId = bestId
            nearestScore = bestCos
          } else {
            dedupDecision = 'ACCEPT'
          }

          chatIdea = idea
          canonical_hash = hash
          break
        }

        if (chatIdea) break

        // Re-prompt anti-eco: registra titoli banditi
        console.log('[reprompt] rejected so far:', rejectedTitles)
      } catch (err) {
        continue
      }
    }

    // Se accettata, salva l'idea in DB
    let savedIdea: Idea | null = null
    if (chatIdea && canonical_hash && dedupDecision) {
      let userId: number
      const maybeUserId = Number(body.user_id)
      if (Number.isFinite(maybeUserId)) {
        userId = maybeUserId
      } else {
        const user = await User.firstOrCreate(
          { email: 'debug@example.com' },
          { email: 'debug@example.com', full_name: 'Debug User', password: 'debugpass' }
        )
        userId = user.id
      }

      savedIdea = await Idea.create({
        title: title_norm,
        description: summary_norm,
        canonicalHash: canonical_hash,
        embedding: lastEmbedding ? JSON.stringify(lastEmbedding) : null,
        duplicateGroupId: dedupDecision === 'ACCEPT_LINK' ? nearestId : null,
        userId,
      })

      // Collega i filtri passati alla nuova idea (tabella ponte idea_filters)
      const filterIdsToAttach = found.map((f) => f.id)
      if (filterIdsToAttach.length > 0) {
        await savedIdea.related('filters').attach(filterIdsToAttach)
        await savedIdea.load('filters')
      }
    }

    return response.ok({
      message: 'Filtri risolti e raggruppati per genere',
      received: input.length,
      resolved: found.length,
      unresolvedIds,
      byGenre,
      prompt_suggestion,
      chatIdea,
      normalization: chatIdea
        ? {
            title_norm,
            summary_norm,
            canonical_hash,
          }
        : null,
      attempts,
      dedup: dedupDecision
        ? {
            decision: dedupDecision,
            nearestId,
            nearestScore,
          }
        : null,
      idea: savedIdea,
      attachedFilterIds: savedIdea ? savedIdea.filters?.map((f: any) => f.id) : [],
      banlist: Array.from(banlist),
      rejectedTitles,
    })
  }
}

function normalizeText(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[\p{Emoji}\p{Extended_Pictographic}]/gu, '')
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeReaction(input: unknown): 'like' | 'dislike' | null {
  if (typeof input === 'string') {
    const v = input.toLowerCase().trim()
    if (v === 'like' || v === '1') return 'like'
    if (v === 'dislike' || v === '0') return 'dislike'
  }
  if (typeof input === 'number') {
    if (input === 1) return 'like'
    if (input === 0) return 'dislike'
  }
  return null
}

function extractKeywords(text: string): string[] {
  const STOP = new Set([
    'the','and','for','con','con','una','uno','una','per','with','your','you','che','nel','nella','gli','le','dei','delle','della','tra','fra','non','sono','come','dove','quando','anche','alla','allo','agli','alle','degli','dei','del','dalla','dallo','dagli','dalle','su','sul','sulla','sui','sugli','sulle'
  ])
  const tokens = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !STOP.has(t))

  const uniq = Array.from(new Set(tokens))
  return uniq.slice(0, 12)
}

