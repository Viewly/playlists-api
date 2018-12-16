exports.up = async function(knex) {
  await knex.schema.alterTable("user", function(t) {
    t.string('twitter_id');
    t.string('twitter_access_token');
    t.string('twitter_refresh_token');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("user", function(t) {
    t.dropColumn('twitter_id');
    t.dropColumn('twitter_access_token');
    t.dropColumn('twitter_refresh_token');
  });
};
