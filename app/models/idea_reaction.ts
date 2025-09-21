import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Idea from '#models/idea'
import User from '#models/user'

export default class IdeaReaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'idea_id' })
  declare ideaId: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column()
  declare reaction: 'like' | 'dislike'

  @belongsTo(() => Idea, { foreignKey: 'ideaId' })
  declare idea: BelongsTo<typeof Idea>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

