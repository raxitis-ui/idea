import type { HttpContext } from '@adonisjs/core/http'
import Genre from '#models/genre'
import Filter from '#models/filter'

export default class GenresController {
  public async index({ response }: HttpContext) {
    const genres = await Genre.query().orderBy('id', 'asc')
    const data = genres.map((g) => ({ id: g.id, name: g.name }))
    return response.ok({ count: data.length, data })
  }

  public async filters({ params, response }: HttpContext) {
    const genreId = Number(params.id)
    if (!Number.isFinite(genreId)) {
      return response.badRequest({ message: 'Parametro id non valido' })
    }
    const filters = await Filter.query().where('genre_id', genreId).orderBy('id', 'asc')
    const data = filters.map((f) => ({ id: f.id, name: f.name, slug: (f as any).slug }))
    return response.ok({ count: data.length, data })
  }
}

