exports.up = async function(knex) {
  await knex.schema.alterTable("user", function(t) {
    t.string('g_access_token');
    t.string('g_refresh_token');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("user", function(t) {
    t.dropColumn('g_access_token');
    t.dropColumn('g_refresh_token');
  });
};
