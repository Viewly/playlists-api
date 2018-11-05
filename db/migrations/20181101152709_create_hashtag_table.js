exports.up = async function(knex) {
  await knex.schema.createTable("hashtag", function(t) {
    t.increments();
    t.string('hashtag');
    t.uuid('playlist_id');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("hashtag");
};
