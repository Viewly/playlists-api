exports.up = async function(knex) {
  await knex.schema.alterTable("notification", function(t) {
    t.uuid('user_id');
    t.string('template_name');
    t.json('metadata');
    t.uuid('playlist_id');
    t.dropColumn('playlists_ids');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("notification", function(t) {
    t.dropColumn('user_id');
    t.dropColumn('template_name');
    t.dropColumn('metadata');
    t.dropColumn('playlist_id');
    t.json('playlists_ids');
  });
};
