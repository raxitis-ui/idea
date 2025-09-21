import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ideas'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('category').nullable().index()
      table.integer('target_age_min').nullable()
      table.integer('target_age_max').nullable()
      table.json('geo').nullable()
      table.json('revenue').nullable()

      table.string('canonical_hash', 128).nullable().unique()
      table.json('embedding').nullable()
      table
        .integer('duplicate_group_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('ideas')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('category')
      table.dropColumn('target_age_min')
      table.dropColumn('target_age_max')
      table.dropColumn('geo')
      table.dropColumn('revenue')
      table.dropUnique(['canonical_hash'])
      table.dropColumn('canonical_hash')
      table.dropColumn('embedding')
      table.dropColumn('duplicate_group_id')
    })
  }
}

