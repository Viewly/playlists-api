exports.up = async function(knex) {
  await knex.schema.alterTable("playlist", function(t) {
    t.boolean('premium');
    t.decimal('price');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("playlist", function(t) {
    t.dropColumn('premium');
    t.dropColumn('price');
  });
};
