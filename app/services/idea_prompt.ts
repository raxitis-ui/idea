export type GroupedFilters = Record<string, { id: number; name: string; slug: string }[]>

export function buildChatPrompt(
  byGenre: GroupedFilters,
  opts?: { banlist?: string[]; diversityDirective?: string; multiCount?: number }
): string {
  const lines: string[] = []
  const multi = Math.max(1, Math.floor(opts?.multiCount || 1))

  if (multi > 1) {
    lines.push(`Genera ${multi} idee diverse tra loro (categorie/angolazioni differenti entro i filtri).`)
    lines.push('Rispondi SOLO JSON: [{"title","summary"}, ...].')
  } else {
    lines.push('Genera 1 idea testabile in 7 giorni.')
    lines.push('Rispondi SOLO JSON {"title", "summary"}.')
  }

  if (opts?.diversityDirective) {
    lines.push(`Diversifica: ${opts.diversityDirective}`)
  }

  if (opts?.banlist && opts.banlist.length > 0) {
    lines.push(
      `Non proporre idee che includano o ruotino attorno a : ${opts.banlist.join(', ')}, pero deve essere sempre inerente ai filtri`
    )
  }

  lines.push('I filtri sono:')
  for (const [genre, items] of Object.entries(byGenre)) {
    const labels = items.map((i) => i.name).join(', ')
    lines.push(`- ${genre}: ${labels}`)
  }

  return lines.join('\n')
}

