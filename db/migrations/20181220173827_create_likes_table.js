exports.up = async function(knex) {
  await knex.schema.createTable("review_likes", function(t) {
    t.increments();
    t.uuid('user_id');
    t.uuid('playlist_id');
    t.integer('review_id');
    t.integer('status');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("review_likes");
};
