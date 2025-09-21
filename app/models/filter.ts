import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Genre from '#models/genre'
import Idea from '#models/idea'

export default class Filter extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column({ columnName: 'genre_id' })
  declare genreId: number

  @belongsTo(() => Genre, { foreignKey: 'genreId' })
  declare genre: BelongsTo<typeof Genre>

  @manyToMany(() => Idea, {
    pivotTable: 'idea_filters',
    pivotForeignKey: 'filter_id',
    pivotRelatedForeignKey: 'idea_id',
  })
  declare ideas: ManyToMany<typeof Idea>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

