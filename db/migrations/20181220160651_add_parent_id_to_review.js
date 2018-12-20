exports.up = async function(knex) {
  await knex.schema.alterTable("review", function(t) {
    t.uuid('parent_id');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("review", function(t) {
    t.dropColumn('parent_id');
  });
};
