import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tasks', (table) => {
    table.string('id', 21).primary();
    table.string('title', 120).notNullable();
    table.text('description').nullable();
    table.string('status', 20).notNullable().defaultTo('pending');
    table.timestamp('created_at').notNullable();
    table.timestamp('updated_at').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tasks');
}
