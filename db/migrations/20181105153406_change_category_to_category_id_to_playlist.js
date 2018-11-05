exports.up = async function(knex) {
  await knex.schema.alterTable("playlist", function(t) {
    t.integer('category_id');
    t.dropColumn('category');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("playlist", function(t) {
    t.string('category');
    t.dropColumn('category_id');
  });
};
