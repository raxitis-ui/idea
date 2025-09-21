import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'filters'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('slug').notNullable()
      table.unique(['genre_id', 'slug'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['genre_id', 'slug'])
      table.dropColumn('slug')
    })
  }
}

