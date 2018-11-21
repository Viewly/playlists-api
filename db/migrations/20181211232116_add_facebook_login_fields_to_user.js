exports.up = async function(knex) {
  await knex.schema.alterTable("user", function(t) {
    t.string('facebook_id');
    t.string('facebook_access_token');
    t.string('facebook_refresh_token');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("user", function(t) {
    t.dropColumn('facebook_id');
    t.dropColumn('facebook_access_token');
    t.dropColumn('facebook_refresh_token');
  });
};
