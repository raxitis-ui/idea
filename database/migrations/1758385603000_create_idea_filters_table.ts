import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'idea_filters'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('idea_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('ideas')
        .onDelete('CASCADE')

      table
        .integer('filter_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('filters')
        .onDelete('CASCADE')

      table.primary(['idea_id', 'filter_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

