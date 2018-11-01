exports.up = async function(knex) {
  await knex.schema.alterTable("playlist", function(t) {
    t.string('hashtags');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("playlist", function(t) {
    t.dropColumn('hashtags');
  });
};
