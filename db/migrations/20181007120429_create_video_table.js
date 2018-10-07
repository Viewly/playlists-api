exports.up = async function(knex) {
  await knex.schema.createTable("video", function(t) {
    t.increments();
    t.string('user_id');
    t.uuid('playlist_id');
    t.integer('source_video_id');

    t.integer('position');
    t.string('title');
    t.string('description');
    t.string('thumbnail_url');

    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("video");
};
