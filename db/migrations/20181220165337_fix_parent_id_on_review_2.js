exports.up = async function(knex) {
  await knex.schema.alterTable("review", async function(t) {
    t.integer('parent_id').defaultTo(-1);
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("review", function(t) {
    t.dropColumn('parent_id');
  });
};
