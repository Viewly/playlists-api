exports.up = async function(knex) {
  await knex.schema.createTable("playlist", function(t) {
    t.uuid('id');
    t.string('user_id');
    t.string('title');
    t.string('description');
    t.string('category');
    t.string('status');
    t.integer('stars');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("playlist");
};
