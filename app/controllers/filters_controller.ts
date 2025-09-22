import type { HttpContext } from '@adonisjs/core/http'
import Genre from '#models/genre'

export default class FiltersController {
  public async grouped({ response }: HttpContext) {
    const genres = await Genre.query().preload('filters')

    const data = genres.map((g) => ({
      id: g.id,
      name: g.name,
      filters: g.filters.map((f) => ({ id: f.id, name: f.name, slug: (f as any).slug }))
    }))

    return response.ok({ count: data.length, data })
  }
}



