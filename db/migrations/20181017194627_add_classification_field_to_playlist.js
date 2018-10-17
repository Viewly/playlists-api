exports.up = async function(knex) {
  await knex.schema.alterTable("playlist", function(t) {
    t.string('classification');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("playlist", function(t) {
    t.dropColumn('classification');
  });
};
