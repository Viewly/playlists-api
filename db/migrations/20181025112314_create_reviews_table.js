exports.up = async function(knex) {
  await knex.schema.createTable("review", function(t) {
    t.increments();
    t.uuid('user_id');
    t.uuid('playlist_id');
    t.string('title');
    t.text('description');
    t.integer('rating');
    t.integer('likes').defaultTo(0);
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("review");
};
