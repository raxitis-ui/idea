import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('ideas', (table) => {
      table.integer('likes_count').unsigned().notNullable().defaultTo(0)
      table.integer('dislikes_count').unsigned().notNullable().defaultTo(0)
    })

    this.schema.createTable('idea_reactions', (table) => {
      table.increments('id').notNullable()
      table
        .integer('idea_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('ideas')
        .onDelete('CASCADE')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.enum('reaction', ['like', 'dislike']).notNullable()
      table.unique(['idea_id', 'user_id'])
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable('idea_reactions')
    this.schema.alterTable('ideas', (table) => {
      table.dropColumn('likes_count')
      table.dropColumn('dislikes_count')
    })
  }
}

