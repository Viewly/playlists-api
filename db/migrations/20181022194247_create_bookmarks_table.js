exports.up = async function(knex) {
  await knex.schema.createTable("bookmark", function(t) {
    t.increments();
    t.uuid('user_id');
    t.uuid('playlist_id');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("bookmark");
};
