import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Filter from '#models/filter'

export default class Idea extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare category: string | null

  @column({ columnName: 'target_age_min' })
  declare targetAgeMin: number | null

  @column({ columnName: 'target_age_max' })
  declare targetAgeMax: number | null

  @column()
  declare geo: any | null

  @column()
  declare revenue: any | null

  @column({ columnName: 'canonical_hash' })
  declare canonicalHash: string | null

  @column()
  declare embedding: any | null

  @column({ columnName: 'duplicate_group_id' })
  declare duplicateGroupId: number | null

  @column({ columnName: 'user_id' })
  declare userId: number

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Filter, {
    pivotTable: 'idea_filters',
    pivotForeignKey: 'idea_id',
    pivotRelatedForeignKey: 'filter_id',
  })
  declare filters: ManyToMany<typeof Filter>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

