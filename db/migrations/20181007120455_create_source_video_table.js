exports.up = async function(knex) {
  await knex.schema.createTable("source_video", function(t) {
    t.increments();
    t.string('title');
    t.string('description');
    t.string('youtube_video_id');
    t.string('youtube_channel_id');
    t.string('thumbnail_url');
    t.string('duration');
    t.string('category');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("source_video");
};
