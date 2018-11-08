exports.up = async function(knex) {
  await knex.schema.alterTable("playlist", function(t) {
    t.datetime('publish_date');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("playlist", function(t) {
    t.dropColumn('publish_date');
  });
};
