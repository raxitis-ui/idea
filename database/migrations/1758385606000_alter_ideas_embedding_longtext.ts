import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ideas'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('embedding', 'longtext').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('embedding').nullable().alter()
    })
  }
}

