exports.up = async function(knex) {
  await knex.schema.createTable("notification", function(t) {
    t.increments();
    t.string('title');
    t.json('categories_ids');
    t.json('playlists_ids');
    t.timestamp('scheduled_for');
    t.string('status');
    t.timestamps();
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("notification");
};
